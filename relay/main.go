package main

import (
	"os"

	"github.com/ethereum/go-ethereum/ethclient"
	log "github.com/sirupsen/logrus"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/kilnfi/ublob/relay/pkg/core"
	"github.com/kilnfi/ublob/relay/pkg/db"
	"github.com/kilnfi/ublob/relay/pkg/relay"
	"github.com/kilnfi/ublob/relay/pkg/types"
)

func main() {
	gormDb, err := gorm.Open(sqlite.Open("relay.db"), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}

	err = gormDb.AutoMigrate(&types.UBlob{}, &types.BlobReceipt{}, &types.UBlobReceipt{}, &types.PendingTransaction{})
	if err != nil {
		log.Fatal(err)
	}

	client, err := ethclient.Dial(os.Getenv("ETH_NODE"))
	if err != nil {
		log.Fatal(err)
	}

	engine := &core.UBlobEngine{
		PrivateKey:           os.Getenv("PRIVATE_KEY"),
		ExecutionLayerClient: client,
		Relay:                relay.NewRelay(db.NewDB(gormDb), client),
	}
	err = engine.Start()

	if err != nil {
		log.Fatal(err)
	}
}
