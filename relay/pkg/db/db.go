package db

import (
	"gorm.io/gorm"

	"github.com/ethereum/go-ethereum/common"
	"github.com/kilnfi/ublob/relay/pkg/types"
)

type DB struct {
	db *gorm.DB
}

func NewDB(db *gorm.DB) *DB {
	return &DB{db: db}
}

func (r *DB) CreateUBlobs(ublobs *types.UBlob) (*types.UBlob, error) {
	if err := r.db.Create(ublobs).Error; err != nil {
		return nil, err
	}
	return ublobs, nil
}

func (r *DB) UpdateUBlobs(ublobs *types.UBlob) error {
	return r.db.Save(ublobs).Error
}

func (r *DB) DeleteUBlobs(ublobs *types.UBlob) error {
	return r.db.Delete(ublobs).Error
}

func (r *DB) CreateBlobReceipts(blobReceipt *types.BlobReceipt) (*types.BlobReceipt, error) {
	err := r.db.Create(blobReceipt).Error
	return blobReceipt, err
}

func (r *DB) GetBlobReceiptsByBlobHash(blobHash []byte) (*types.BlobReceipt, error) {
	blobReceipt := new(types.BlobReceipt)
	err := r.db.Where(types.BlobReceipt{
		BlobHash: blobHash,
	}).First(&blobReceipt).Error

	return blobReceipt, err
}

func (r *DB) GetElligibleUBlobs(timestamp uint64) ([]*types.UBlob, error) {
	ublobs := []*types.UBlob{}
	err := r.db.Where("expiration_timestamp > ?", timestamp).Where("u_blob_receipt_id == 0").Order("max_wei_per_byte desc").Find(&ublobs).Error

	return ublobs, err
}

func (r *DB) GetUBlobReceiptByBlobID(blobID uint) (*types.UBlobReceipt, error) {
	ublob := new(types.UBlob)
	err := r.db.Where(types.UBlob{
		ID: blobID,
	}).Preload("UBlobReceipt").First(&ublob).Error

	return ublob.UBlobReceipt, err
}

func (r *DB) GetUBlobsBy(blobID uint) (*types.UBlob, error) {
	ublob := new(types.UBlob)
	err := r.db.Where(types.UBlob{
		ID: blobID,
	}).First(&ublob).Error

	return ublob, err
}

func (r *DB) GetUBlobsBySender(sender common.Address) ([]*types.UBlob, error) {
	ublob := []*types.UBlob{}
	err := r.db.Where(types.UBlob{
		Sender: sender,
	}).Find(&ublob).Error

	return ublob, err
}

func (r *DB) GetPendingTransaction(nonce uint) (*types.PendingTransaction, error) {
	pendingTransaction := new(types.PendingTransaction)
	err := r.db.Where(types.PendingTransaction{
		ID: nonce,
	}).First(&pendingTransaction).Error

	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}

	return pendingTransaction, err
}

func (r *DB) UpsertPendingTransaction(tx *types.PendingTransaction) error {
	return r.db.Save(tx).Error
}

func (r *DB) SetUBlobReceipt(ublobID uint, receipt *types.UBlobReceipt) error {
	if err := r.db.Create(receipt).Error; err != nil {
		return err
	}
	return r.db.Model(&types.UBlob{}).Where("id = ?", ublobID).Update("u_blob_receipt_id", receipt.ID).Error
}

func (r *DB) GetUBlobsByBlobID(blobHash []byte) (*types.BlobReceipt, error) {
	receipt := new(types.BlobReceipt)
	err := r.db.Where(types.BlobReceipt{
		BlobHash: blobHash,
	}).Preload("UBlobReceipts.Blob").First(&receipt).Error

	return receipt, err
}

func (r *DB) GetBlobs() ([]*types.BlobReceipt, error) {
	var blobReceipts []*types.BlobReceipt
	err := r.db.Find(&blobReceipts).Error
	return blobReceipts, err
}
