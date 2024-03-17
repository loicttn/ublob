package core

import (
	"context"
	"crypto/ecdsa"
	"encoding/binary"
	"fmt"
	"math/big"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"time"

	"github.com/consensys/gnark-crypto/ecc/bls12-381/fr"
	gokzg4844 "github.com/crate-crypto/go-kzg-4844"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/consensus/misc/eip4844"
	geth_types "github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/crypto/kzg4844"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/holiman/uint256"
	"github.com/kilnfi/ublob/relay/pkg/relay"
	"github.com/kilnfi/ublob/relay/pkg/router"
	"github.com/kilnfi/ublob/relay/pkg/types"
	"github.com/shopspring/decimal"
	log "github.com/sirupsen/logrus"
)

type UBlobEngine struct {
	// config
	PrivateKey           string
	ExecutionLayerClient *ethclient.Client
	Relay                *relay.Relay

	// state
	pk            *ecdsa.PrivateKey
	proposer      common.Address
	proposerNonce uint64

	// loop state
	lastHeader    *geth_types.Header
	ublobs        []*types.UBlob
	lastBlobHash  common.Hash
	blobChecksums map[common.Hash]uint64
	blobGasFeeCap map[common.Hash]*big.Int
	blobGasTipCap map[common.Hash]*big.Int
}

func (e *UBlobEngine) Start() error {
	e.blobChecksums = make(map[common.Hash]uint64)
	e.blobGasFeeCap = make(map[common.Hash]*big.Int)
	e.blobGasTipCap = make(map[common.Hash]*big.Int)

	var err error

	e.pk, err = crypto.HexToECDSA(e.PrivateKey)
	if err != nil {
		return err
	}

	pubKey := e.pk.Public()
	pubKeyECDSA, ok := pubKey.(*ecdsa.PublicKey)
	if !ok {
		return fmt.Errorf("error casting public key to ECDSA")
	}
	e.proposer = crypto.PubkeyToAddress(*pubKeyECDSA)

	log.Infof("proposer loaded = %s", e.proposer.Hex())

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	ctx, cancel := context.WithCancel(context.Background())

	rtr := router.NewRouter(e.Relay)
	srv := &http.Server{
		Addr:    ":8080",
		Handler: rtr,
	}

	wg := &sync.WaitGroup{}

	wg.Add(2)

	go e.startSignalListener(ctx, cancel, c, srv)
	go e.startApi(srv, wg, cancel)
	go e.startCoreLoop(ctx, cancel, wg)

	wg.Wait()

	return nil
}

func (e *UBlobEngine) startApi(srv *http.Server, wg *sync.WaitGroup, cancel context.CancelFunc) {
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("listen: %s\n", err)
	}
	log.Info("api done")
	wg.Done()
}

var BLOB_SIZE = 32 * 4096

type blobinous struct {
	id      uint
	receipt *types.UBlobReceipt
}

type Tx struct {
	tx        *geth_types.Transaction
	Size      uint64
	blobinous []blobinous
	blobHash  common.Hash
}

var pendings []Tx

func (e *UBlobEngine) startCoreLoop(ctx context.Context, cancel context.CancelFunc, wg *sync.WaitGroup) {
	ticker := time.NewTicker(5 * time.Second)
	for {
		select {
		case <-ctx.Done():
			log.Info("core loop done")
			wg.Done()
			return
		case <-ticker.C:
			currentHeader, err := e.ExecutionLayerClient.HeaderByNumber(ctx, nil)
			if err != nil {
				log.Warnf("error getting header: %v", err)
				continue
			}

			if e.lastHeader == nil || e.lastHeader.Hash().Cmp(currentHeader.Hash()) != 0 {
				log.Infof("new head = %d", currentHeader.Number.Uint64())
				e.lastHeader = currentHeader
			}

			proposerNonce, err := e.ExecutionLayerClient.NonceAt(ctx, e.proposer, e.lastHeader.Number)
			if err != nil {
				log.Warnf("error getting nonce: %v", err)
				continue
			}

			if e.proposerNonce != proposerNonce {
				log.Infof("proposer nonce = %d", proposerNonce)
				e.proposerNonce = proposerNonce
				if len(pendings) > 0 {
					for _, pending := range pendings {
						receipt, err := e.ExecutionLayerClient.TransactionReceipt(ctx, pending.tx.Hash())
						if err != nil {
							log.Warnf("error getting receipt: %v", err)
							continue
						}

						if receipt != nil {
							receipt, err := e.Relay.DB.CreateBlobReceipts(&types.BlobReceipt{
								BlobHash:     pending.blobHash,
								BlobGasPrice: receipt.BlobGasPrice.String(),
								Size:         pending.Size,
								Timestamp:    uint64(pending.tx.Time().Unix()),
							})
							if err != nil {
								log.Warnf("error creating blob receipt: %v", err)
								continue
							}

							log.Infof("transaction %s mined", pending.tx.Hash().String())
							for _, b := range pending.blobinous {
								log.Infof("setting blob receipt for blob %d", b.id)
								e.Relay.DB.SetUBlobReceipt(b.id, &types.UBlobReceipt{
									Offset:        b.receipt.Offset,
									Size:          b.receipt.Size,
									BlobReceiptID: receipt.ID,
								})
							}

							pendings = []Tx{}
						}
					}
				}
			}

			blobFeeCap := eip4844.CalcBlobFee(*e.lastHeader.ExcessBlobGas)

			ublobs, err := e.Relay.DB.GetElligibleUBlobs(e.lastHeader.Time)
			if err != nil {
				log.Warnf("error getting eligible ublobs: %v", err)
				continue
			}

			fmt.Printf("blobBaseFee = %+v\n", blobFeeCap)

			elligible_ublobs := []*types.UBlob{}
			availableSpace := BLOB_SIZE

			portionFee := big.NewInt(0)
			baseWeiPerByte := big.NewInt(0).Div(blobFeeCap, big.NewInt(int64(BLOB_SIZE)))

			currentTx := Tx{}
			for _, ublob := range ublobs {
				delta := e.lastHeader.Number.Uint64() - ublob.CreationBlockNumber

				extraFeePerByte := decimal.NewFromFloat32(ublob.AgeFactor).Mul(decimal.NewFromFloat32(float32(delta)))
				adaptedWeiPerByte := big.NewInt(0).Add(baseWeiPerByte, extraFeePerByte.BigInt())
				dataFee := big.NewInt(0).Mul(adaptedWeiPerByte, big.NewInt(int64(len(ublob.Data))))

				portionFee.Add(portionFee, dataFee)

				extrapolatedDataFee := big.NewInt(0).Mul(adaptedWeiPerByte, big.NewInt(int64(BLOB_SIZE)))

				if extrapolatedDataFee.Cmp(blobFeeCap) < 0 {
					log.Infof("lower than blobFeeCap\n")
					continue
				}

				if availableSpace < len(ublob.Data) {
					continue
				}

				println("ublob.Data", len(ublob.Data))

				currentTx.blobinous = append(currentTx.blobinous, blobinous{
					id: ublob.ID,
					receipt: &types.UBlobReceipt{
						ID:     ublob.ID,
						Offset: uint64(BLOB_SIZE) - uint64(availableSpace),
						Size:   uint64(len(ublob.Data)),
					},
				})

				elligible_ublobs = append(elligible_ublobs, ublob)
				availableSpace -= len(ublob.Data)
			}

			raw_payload := []byte{}

			for _, ublob := range elligible_ublobs {
				raw_payload = append(raw_payload, []byte(ublob.Data)...)
			}

			if len(raw_payload) == 0 {
				log.Infof("no ublobs\n")
				continue
			}

			remainingLength := BLOB_SIZE - len(raw_payload)
			remainingFee := big.NewInt(0).Div(big.NewInt(0).Mul(big.NewInt(int64(remainingLength)), blobFeeCap), big.NewInt(int64(BLOB_SIZE)))

			customFee := big.NewInt(0).Add(portionFee, remainingFee)

			println("customFee", customFee.String())
			println("  blobFee", blobFeeCap.String())
			println("raw_payload", len(raw_payload))

			b := make([]byte, 8)
			binary.LittleEndian.PutUint64(b, proposerNonce)
			// append nonce and raw_payload
			hash_payload := append(b, raw_payload...)
			hash_payload = append(customFee.Bytes(), hash_payload...)

			payload_hash := crypto.Keccak256Hash(hash_payload)
			if _, ok := e.blobChecksums[payload_hash]; ok {
				log.Infof("blob already sent: %s", payload_hash.String())
				continue
			}

			gasTipCap, err := e.ExecutionLayerClient.SuggestGasTipCap(context.Background())
			if err != nil {
				log.Warnf("failed to get suggest gas tip cap: %v", err)
				continue
			}

			gasFeeCap, err := e.ExecutionLayerClient.SuggestGasPrice(context.Background())
			if err != nil {
				log.Warnf("failed to get suggest gas price: %v", err)
				continue
			}

			pendingTx, err := e.Relay.DB.GetPendingTransaction(uint(proposerNonce))
			if err != nil {
				log.Warnf("failed to get pending transaction: %v", err)
				continue
			}

			if pendingTx != nil {
				storedMaxPriorityFeePerGas, ok := big.NewInt(0).SetString(pendingTx.MaxPriorityFeePerGas, 0)
				if !ok {
					log.Warnf("failed to parse max priority fee per gas: %v", err)
					continue
				}
				storedMaxFeePerGas, ok := big.NewInt(0).SetString(pendingTx.MaxFeePerGas, 0)
				if !ok {
					log.Warnf("failed to parse max fee per gas: %v", err)
					continue
				}
				gasTipCap = big.NewInt(0).Mul(storedMaxPriorityFeePerGas, big.NewInt(2))
				gasFeeCap = big.NewInt(0).Mul(storedMaxFeePerGas, big.NewInt(2))
				customFee = big.NewInt(0).Mul(customFee, big.NewInt(2))
			}

			chainID, err := e.ExecutionLayerClient.NetworkID(context.Background())
			if err != nil {
				log.Warnf("failed to get chain id: %v", err)
			}

			var blob kzg4844.Blob

			for i := 0; i < len(raw_payload); i += 32 {
				end := i + 32
				if end > len(raw_payload) {
					end = len(raw_payload)
				}
				bytes := make([]byte, 32)
				copy(bytes, raw_payload[i:end])
				var r fr.Element
				r.SetBytes(bytes)
				serializedScalar := gokzg4844.SerializeScalar(r)
				copy(blob[i:i+gokzg4844.SerializedScalarSize], serializedScalar[:])
			}

			sideCar := makeSidecar([]kzg4844.Blob{blob})
			blobHashes := sideCar.BlobHashes()

			currentTx.blobHash = blobHashes[0]
			currentTx.Size = uint64(len(raw_payload))

			// doubleGasFee := big.NewInt(0).Mul(gasFeeCap, big.NewInt(10))
			// doubleGasTip := big.NewInt(0).Mul(gasTipCap, big.NewInt(10))

			tx := geth_types.NewTx(&geth_types.BlobTx{
				ChainID:   uint256.MustFromBig(chainID),
				Nonce:     proposerNonce,
				GasTipCap: uint256.MustFromBig(gasTipCap),
				GasFeeCap: uint256.MustFromBig(gasFeeCap),
				// GasTipCap:  uint256.MustFromBig(doubleGasTip),
				// GasFeeCap:  uint256.MustFromBig(doubleGasFee),
				Gas:        21000,
				To:         common.HexToAddress("0xb10000000000000000000000000000000000000b"),
				BlobFeeCap: uint256.MustFromBig(customFee),
				BlobHashes: blobHashes,
				Sidecar:    sideCar,
			})
			log.Errorf("upserting pending transaction: %+v & %+v", tx.GasFeeCap().String(), tx.GasTipCap().String())

			auth, err := bind.NewKeyedTransactorWithChainID(e.pk, chainID)
			if err != nil {
				log.Warnf("failed to create transactor: %v", err)
				continue
			}

			signedTx, err := auth.Signer(auth.From, tx)
			if err != nil {
				log.Warnf("failed to sign the transaction: %v", err)
				continue
			}

			e.blobChecksums[payload_hash] = proposerNonce

			pendingTx = &types.PendingTransaction{
				MaxFeePerGas:         tx.GasFeeCap().String(),
				MaxPriorityFeePerGas: tx.GasTipCap().String(),
				BloFeePersGas:        tx.BlobGasFeeCap().String(),
				ID:                   uint(proposerNonce),
			}

			err = e.Relay.DB.UpsertPendingTransaction(pendingTx)
			if err != nil {
				log.Warnf("failed to upsert pending transaction: %v", err)
				continue
			}

			err = e.ExecutionLayerClient.SendTransaction(context.Background(), signedTx)
			if err != nil {
				log.Warnf("failed to send the transaction: %v", err)
				continue
			}

			currentTx.tx = signedTx
			log.Debugf("currentTx: %+v", currentTx)
			pendings = append(pendings, currentTx)

			log.WithFields(log.Fields{
				"hash":       signedTx.Hash().String(),
				"chainID":    signedTx.ChainId(),
				"nonce":      signedTx.Nonce(),
				"gasTipCap":  signedTx.GasTipCap(),
				"gasFeeCap":  signedTx.GasFeeCap(),
				"gasLimit":   signedTx.Gas(),
				"to":         signedTx.To(),
				"blobFeeCap": signedTx.BlobGasFeeCap(),
				"blobHashes": signedTx.BlobHashes(),
			}).Info("escalating gas prices and resending transaction")
		}
	}
}

func makeSidecar(blobs []kzg4844.Blob) *geth_types.BlobTxSidecar {
	var (
		commitments []kzg4844.Commitment
		proofs      []kzg4844.Proof
	)

	for _, blob := range blobs {
		c, _ := kzg4844.BlobToCommitment(blob)
		p, _ := kzg4844.ComputeBlobProof(blob, c)

		commitments = append(commitments, c)
		proofs = append(proofs, p)
	}

	return &geth_types.BlobTxSidecar{
		Blobs:       blobs,
		Commitments: commitments,
		Proofs:      proofs,
	}
}

func (e *UBlobEngine) startSignalListener(ctx context.Context, cancel context.CancelFunc, c chan os.Signal, srv *http.Server) {
	for {
		select {
		case <-ctx.Done():
			log.Info("signal listener done")
			err := srv.Shutdown(ctx)
			if err != nil {
				log.Warnf("error shutting down server: %v", err)
			}
			return
		case <-c:
			log.Info("received interrupt signal")
			cancel()
		}
	}
}
