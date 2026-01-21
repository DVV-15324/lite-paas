package invoice

import "database/sql"

type InvoiceServiceSQL struct {
	db *sql.DB
}

func NewInvoiceServiceSQL(db *sql.DB) *InvoiceServiceSQL {
	return &InvoiceServiceSQL{
		db: db,
	}
}
