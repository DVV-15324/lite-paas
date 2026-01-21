package runtime_env

import "database/sql"

type RuntimeEnvSeviceSQL struct {
	db *sql.DB
}

func NewRuntimeEnvSeviceSQL(db *sql.DB) *RuntimeEnvSeviceSQL {
	return &RuntimeEnvSeviceSQL{
		db: db,
	}
}
