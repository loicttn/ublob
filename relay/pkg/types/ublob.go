package types

import (
	"github.com/ethereum/go-ethereum/common"
	"github.com/shopspring/decimal"
	_ "gorm.io/gorm"
)

type UBlobReceipt struct {
	ID uint

	Offset uint64
	Size   uint64

	Blob          *UBlob `gorm:"foreignKey:UBlobReceiptID"`
	BlobReceiptID uint
	BlobReceipt   *BlobReceipt
}

type UBlob struct {
	ID                  uint
	Data                string // capped to 128k0 - 28
	Sender              common.Address
	Signature           string
	MaxWeiPerByte       decimal.Decimal
	AgeFactor           float32
	ExpirationTimestamp uint64
	CreationTimestamp   uint64
	CreationBlockNumber uint64
	UBlobReceiptID      uint64
	UBlobReceipt        *UBlobReceipt
}

type BlobReceipt struct {
	ID       uint
	BlobHash []byte

	UBlobReceipts []*UBlobReceipt `gorm:"foreignKey:BlobReceiptID"`
}

type PendingTransaction struct {
	ID                   uint
	MaxFeePerGas         string
	MaxPriorityFeePerGas string
	BloFeePersGas        string
}
