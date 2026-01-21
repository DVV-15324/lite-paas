package user

import "database/sql"

type UserServiceSQL struct {
	db *sql.DB
}

func NewUserServiceSQL(db *sql.DB) *UserServiceSQL {
	return &UserServiceSQL{db: db}
}
