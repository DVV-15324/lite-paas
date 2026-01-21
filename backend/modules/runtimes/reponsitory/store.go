package runtime

import "database/sql"

type RuntimeServiceSQL struct {
	db *sql.DB
}

func NewRuntimeServiceSQL(db *sql.DB) *RuntimeServiceSQL {
	return &RuntimeServiceSQL{
		db: db,
	}
}
