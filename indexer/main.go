package main

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/spf13/viper"
	"github.com/kilnfi/ublob/indexer/indexer"
)

func main() {
	// Setup Viper to read the config
	viper.SetConfigFile("config.yaml")
	err := viper.ReadInConfig()
	if err != nil {
		log.Fatalf("Error reading config file, %s", err)
	}

	// Retrieve the configuration variables
	ethereumNodeURL := viper.GetString("ethereumNodeURL")
	contractAddress := viper.GetString("contractAddress")
	topic0 := viper.GetString("topic0")
	FromBlock := viper.GetInt64("fromBlock")

	// Connect to the Ethereum node
	client, err := ethclient.Dial(ethereumNodeURL)
	if err != nil {
		log.Fatalf("Failed to connect to the Ethereum client: %v", err)
	}

	// Use the configuration variables
	address := common.HexToAddress(contractAddress)
	topicHash := common.HexToHash(topic0)

	log.Printf("Listening for logs on contract %s, topic %s", address.Hex(), topicHash.Hex())
	db, err := sql.Open("sqlite3", "./ethereum_logs.db")
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()
	indexer.RunMigration(db)

	config := indexer.Config{
		EthereumNodeURL: ethereumNodeURL,
		ContractAddress: common.HexToAddress(contractAddress),
		Topic0:          common.HexToHash(topic0),
		FromBlock:       FromBlock,
		Client:          client,
	}

	ind, err := indexer.NewIndexer(config)
	if err != nil {
		log.Fatalf("Failed to create indexer: %v", err)
	}
	ind.Run()
	
}
