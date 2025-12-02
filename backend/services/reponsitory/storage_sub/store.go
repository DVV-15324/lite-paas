package storagesub

import "database/sql"

type StorageSubServiceSQL struct {
	db *sql.DB
}

// Constructor
func NewSubscriptionServiceSQL(db *sql.DB) *StorageSubServiceSQL {
	return &StorageSubServiceSQL{db: db}
}
