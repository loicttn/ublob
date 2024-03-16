package main

import (
	"context"
	"fmt"
	"log"
	"math/big"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
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
	topic0 := viper.GetString("topic0")
	fromBlock := viper.GetInt64("fromBlock")

	// Connect to the Ethereum node
	client, err := ethclient.Dial(ethereumNodeURL)
	if err != nil {
		log.Fatalf("Failed to connect to the Ethereum client: %v", err)
	}

	// Use the configuration variables
	address := common.HexToAddress(contractAddress)
	topicHash := common.HexToHash(topic0)

	// Create a query to filter logs
	logs, err := client.FilterLogs(context.Background(), ethereum.FilterQuery{
		FromBlock: big.NewInt(fromBlock),
		Addresses: []common.Address{address},
		Topics:    [][]common.Hash{{topicHash}},
	})
	if err != nil {
		log.Fatalf("Failed to fetch logs: %v", err)
	}

	for _, vLog := range logs {
		fmt.Println(vLog)
	}
}
