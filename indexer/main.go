package main

import (
	"log"

	_ "github.com/mattn/go-sqlite3"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/kilnfi/ublob/indexer/indexer"
	"github.com/spf13/viper"
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
	FromBlock := viper.GetInt64("fromBlock")

	// Connect to the Ethereum node
	client, err := ethclient.Dial(ethereumNodeURL)
	if err != nil {
		log.Fatalf("Failed to connect to the Ethereum client: %v", err)
	}

	// Use the configuration variables
	address := common.HexToAddress(contractAddress)
	topicHash := common.HexToHash("0x1bbf55d483639f8103dc4e035af71a4fbdb16c80be740fa3eef81198acefa094")

	log.Printf("Listening for logs on contract %s, topic %s", address.Hex(), topicHash.Hex())

	config := indexer.Config{
		EthereumNodeURL: ethereumNodeURL,
		ContractAddress: common.HexToAddress(contractAddress),
		Topic0:          topicHash,
		FromBlock:       FromBlock,
		Client:          client,
	}

	ind, err := indexer.NewIndexer(config)
	if err != nil {
		log.Fatalf("Failed to create indexer: %v", err)
	}
	ind.Run()

}
