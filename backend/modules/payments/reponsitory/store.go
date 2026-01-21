package payment

import "database/sql"

type PaymentServiceSQL struct {
	db *sql.DB
}

func NewPaymentServiceSQL(db *sql.DB) *PaymentServiceSQL {
	return &PaymentServiceSQL{
		db: db,
	}
}
