package database_env

import "database/sql"

type DatabaseEnvServiceSQL struct {
	db *sql.DB
}

func NewDatabaseEnvServiceSQL(db *sql.DB) *DatabaseEnvServiceSQL {
	return &DatabaseEnvServiceSQL{
		db: db,
	}
}
