package database_sub

import "database/sql"

type DatabaseSubServiceSQL struct {
	db *sql.DB
}

// Constructor
func NewDatabaseSubServiceSQL(db *sql.DB) *DatabaseSubServiceSQL {
	return &DatabaseSubServiceSQL{db: db}
}
