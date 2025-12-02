package ticketmessage

import (
	"database/sql"
)

type TicketMessageServiceSQL struct {
	db *sql.DB
}

func NewTicketReplyServiceSQL(db *sql.DB) *TicketMessageServiceSQL {
	return &TicketMessageServiceSQL{db: db}
}
