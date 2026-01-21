package runtimesub

import "database/sql"

type RuntimeSubServiceSQL struct {
	db *sql.DB
}

// Constructor
func NewSubscriptionServiceSQL(db *sql.DB) *RuntimeSubServiceSQL {
	return &RuntimeSubServiceSQL{db: db}
}
