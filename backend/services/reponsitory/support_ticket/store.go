package support_ticket

import (
	"database/sql"
)

type SupportTicketServiceSQL struct {
	db *sql.DB
}

func NewSupportTicketServiceSQL(db *sql.DB) *SupportTicketServiceSQL {
	return &SupportTicketServiceSQL{db: db}
}
