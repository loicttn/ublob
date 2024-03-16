package indexer

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/mattn/go-sqlite3"

	"github.com/ethereum/go-ethereum/common"
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
	client *ethclient.Client
	db     *sql.DB
	Config Config
}

func NewIndexer(config Config) (*Indexer, error) {
	client, err := ethclient.Dial(config.EthereumNodeURL)
	if err != nil {
		return nil, err
	}

	db, err := sql.Open("sqlite3", "./ethereum_logs.db")
	if err != nil {
		return nil, err
	}

	return &Indexer{
		client: client,
		db:     db,
		Config: config,
	}, nil
}

func RunMigration(db *sql.DB) {
	createTableSQL := `CREATE TABLE IF NOT EXISTS logs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		blockNumber INTEGER,
		"index" INTEGER,
		data TEXT,
		timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	statement, err := db.Prepare(createTableSQL)
	if err != nil {
		log.Fatalf("Failed to prepare migration: %v", err)
	}
	defer statement.Close()

	_, err = statement.Exec()
	if err != nil {
		log.Fatalf("Failed to execute migration: %v", err)
	}

	fmt.Println("Migration ran successfully")
}

func getCurrentBlockNumber(client *ethclient.Client, ctx context.Context) (int64, error) {
	header, err := client.HeaderByNumber(ctx, nil)
	if err != nil {
		return 0, err
	}
	return header.Number.Int64(), nil
}

func(i *Indexer) Run() {
	
	
	ticker := time.NewTicker(20 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			fromBlock, err := i.getLastBlockNumber(i.db)
			if err != nil {
				log.Printf("Failed to get last block number: %v", err)
				continue
			}
			i.Config.FromBlock = fromBlock
			logs, err := i.FetchLogs()
			if err != nil {
				log.Printf("Failed to fetch logs: %v", err)
				continue // Optionally implement a backoff strategy
			}

			for _, logEntry := range logs {
				err := insertLog(i.db, logEntry)
				if err != nil {
					log.Printf("Failed to insert log into database: %v", err)
				} else {
					fmt.Println("Log inserted into database successfully.")
				}
			}
		}
	}
}
