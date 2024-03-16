package indexer

import (
	"context"
	"database/sql"
	"math/big"

	ethtypes "github.com/ethereum/go-ethereum/core/types"
	_ "github.com/mattn/go-sqlite3"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
)

func insertLog(db *sql.DB, logEntry ethtypes.Log) error {
	// Prepare SQL statement
	stmt, err := db.Prepare(`INSERT INTO logs(blockNumber, "index", data) VALUES(?, ?, ?)`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	// Execute SQL statement
	_, err = stmt.Exec(logEntry.BlockNumber, logEntry.Index, logEntry.Data)
	if err != nil {
		return err
	}

	return nil
}
func (i *Indexer) getLastBlockNumber(db *sql.DB) (int64, error) {
	var lastBlockNumber int64
	err := db.QueryRow("SELECT MAX(blockNumber) FROM logs").Scan(&lastBlockNumber)
	if err != nil {
		return 0, err
	}
	if lastBlockNumber == 0 {
		return i.Config.FromBlock, nil
	}
	return lastBlockNumber, nil
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
