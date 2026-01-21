package auth

import (
	"database/sql"
)

type AuthServiceSQL struct {
	db *sql.DB
}

func NewAuthServiceSQL(db *sql.DB) *AuthServiceSQL {
	return &AuthServiceSQL{db: db}
}
