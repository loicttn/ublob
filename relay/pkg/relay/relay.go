package relay

import (
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/gin-gonic/gin"
	"github.com/kilnfi/ublob/relay/pkg/db"
	"github.com/kilnfi/ublob/relay/pkg/types"
	"github.com/shopspring/decimal"
)

type Relay struct {
	DB     RelayDB
	client *ethclient.Client
}

type RelayDB interface {
	CreateUBlobs(ublobs *types.UBlob) (*types.UBlob, error)
	UpdateUBlobs(ublobs *types.UBlob) error
	DeleteUBlobs(ublobs *types.UBlob) error
	CreateBlobReceipts(blobReceipt *types.BlobReceipt) (*types.BlobReceipt, error)
	GetBlobReceiptsByBlobHash(blobHash []byte) (*types.BlobReceipt, error)
	GetUBlobReceiptByBlobID(blobID uint) (*types.UBlobReceipt, error)
	GetUBlobsBy(blobID uint) (*types.UBlob, error)
	GetUBlobsBySender(sender common.Address) ([]*types.UBlob, error)
	GetElligibleUBlobs(timestamp uint64) ([]*types.UBlob, error)
	GetPendingTransaction(nonce uint) (*types.PendingTransaction, error)
	UpsertPendingTransaction(tx *types.PendingTransaction) error
	SetUBlobReceipt(blobID uint, receipt *types.UBlobReceipt) error
	GetUBlobsByBlobID(blobHash []byte) (*types.BlobReceipt, error)
	GetBlobs() ([]*types.BlobReceipt, error)
}

func NewRelay(db *db.DB, client *ethclient.Client) *Relay {
	return &Relay{DB: db, client: client}
}

type CreateUBlobRequest struct {
	Data                string
	Sender              string
	Signature           string
	MaxWeiPerByte       string
	AgeFactor           float32
	ExpirationTimestamp uint64
}

func (r *Relay) CreateUBlobRequest(c *gin.Context) {
	var req CreateUBlobRequest
	if err := c.BindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("%+v\n", req)

	maxWeiPerByteBigInt, ok := big.NewInt(0).SetString(req.MaxWeiPerByte, 10)
	if !ok {
		c.JSON(400, gin.H{"error": "invalid maxWeiPerByte"})
		return
	}

	maxWeiPerByte := decimal.NewFromBigInt(maxWeiPerByteBigInt, 0)

	header, err := r.client.HeaderByNumber(c.Request.Context(), nil)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	ublob := &types.UBlob{
		Data:                req.Data,
		Sender:              common.HexToAddress(req.Sender),
		Signature:           req.Signature,
		MaxWeiPerByte:       maxWeiPerByte,
		AgeFactor:           req.AgeFactor,
		ExpirationTimestamp: req.ExpirationTimestamp,
		CreationTimestamp:   header.Time,
		CreationBlockNumber: header.Number.Uint64(),
	}

	ublob, err = r.DB.CreateUBlobs(ublob)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"ublob": ublob})
}

func (r *Relay) GetUBlobRequest(c *gin.Context) {
	ublobs, err := r.DB.GetElligibleUBlobs(0)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"ublobs": ublobs})
}

func (r *Relay) GetUblobsByID(c *gin.Context) {
	hash := c.Param("blobHash")
	hashh := common.HexToHash(hash)
	ublob, err := r.DB.GetUBlobsByBlobID(hashh[:])
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"ublob": ublob})
}

func (r *Relay) GetBlobs(c *gin.Context) {
	blobs, err := r.DB.GetBlobs()
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.JSON(200, gin.H{"blobs": blobs})
}
