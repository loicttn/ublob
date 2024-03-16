package indexer

import (
	"context"
	"log"
	"math/big"
	"strings"
	"time"

	_ "github.com/mattn/go-sqlite3"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	ethtypes "github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

type Config struct {
	EthereumNodeURL string
	ContractAddress common.Address
	Topic0          common.Hash
	FromBlock       int64
	Client          *ethclient.Client
}

type Indexer struct {
	client          *ethclient.Client
	Config          Config
	CreditsRegistry CreditsRegistry
}

func NewIndexer(config Config) (*Indexer, error) {
	client, err := ethclient.Dial(config.EthereumNodeURL)
	if err != nil {
		return nil, err
	}

	return &Indexer{
		client:          client,
		Config:          config,
		CreditsRegistry: NewCreditsRegistry(),
	}, nil
}

func getCurrentBlockNumber(client *ethclient.Client, ctx context.Context) (int64, error) {
	header, err := client.HeaderByNumber(ctx, nil)
	if err != nil {
		return 0, err
	}
	return header.Number.Int64(), nil
}

func (i *Indexer) FetchLogs() ([]ethtypes.Log, error) {
	toblock, err := getCurrentBlockNumber(i.client, context.Background())
	if err != nil {
		return nil, err
	}
	toblock = toblock + 1

	logs, err := i.client.FilterLogs(context.Background(), ethereum.FilterQuery{
		FromBlock: big.NewInt(i.Config.FromBlock),
		ToBlock:   big.NewInt(int64(toblock)),
		Addresses: []common.Address{i.Config.ContractAddress},
		Topics:    [][]common.Hash{{i.Config.Topic0}},
	})
	if err != nil {
		return nil, err
	}
	return logs, nil
}

func (i *Indexer) Run() {

	ticker := time.NewTicker(12 * time.Second)
	defer ticker.Stop()

	contractAbi, err := abi.JSON(strings.NewReader(`[{"type":"constructor","inputs":[{"name":"_receiver","type":"address","internalType":"address payable"}],"stateMutability":"nonpayable"},{"type":"receive","stateMutability":"payable"},{"type":"function","name":"receiver","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address payable"}],"stateMutability":"view"},{"type":"event","name":"Credit","inputs":[{"name":"creditee","type":"address","indexed":true,"internalType":"address"},{"name":"amount","type":"uint256","indexed":false,"internalType":"uint256"}],"anonymous":false},{"type":"error","name":"Invalid","inputs":[]}]`))
	if err != nil {
		log.Fatal("Failed to parse ABI: ", err)
	}

	for {
		select {
		case <-ticker.C:
			fromBlock := i.Config.FromBlock
			if err != nil {
				log.Printf("Failed to get last block number: %v", err)
				continue
			}
			currentHeight, err := getCurrentBlockNumber(i.client, context.Background())
			if err != nil {
				log.Printf("Failed to get current block number: %v", err)
				continue
			}
			if fromBlock >= currentHeight {
				log.Printf("No new blocks to index")
				continue
			}
			i.Config.FromBlock = fromBlock
			logs, err := i.FetchLogs()
			if err != nil {
				log.Printf("Failed to fetch logs: %v", err)
				continue // Optionally implement a backoff strategy
			}

			for _, logEntry := range logs {
				var event CreditEvent

				err := contractAbi.UnpackIntoInterface(&event, "Credit", logEntry.Data)
				if err != nil {
					log.Printf("Failed to unpack log data: %v", err)
					continue
				}
				event.Creditee = common.HexToAddress(logEntry.Topics[1].Hex())
				i.CreditsRegistry.AddCredit(event)

				log.Printf("Event: %v", event)
			}
			log.Printf("Indexed %d logs", len(logs))
		}
	}
}
