package storage

import (
	"database/sql"
)

type StorageServiceSQL struct {
	db *sql.DB
}

func NewStorageServiceSQL(db *sql.DB) *StorageServiceSQL {
	return &StorageServiceSQL{
		db: db,
	}
}
