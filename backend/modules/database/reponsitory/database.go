package database

import (
	"database/sql"
)

type DatabaseServiceSQL struct {
	db *sql.DB
}

func NewDatabaseServiceSQL(db *sql.DB) *DatabaseServiceSQL {
	return &DatabaseServiceSQL{
		db: db,
	}
}
