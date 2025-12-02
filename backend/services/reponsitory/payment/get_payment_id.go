package payment

import (
	"context"
	"database/sql"
	"fmt"
	entityPayment "lite-paas/services/entity/payment"
)

func (s *PaymentServiceSQL) GetPaymentByID(ctx context.Context, id int64) (*entityPayment.Payment, error) {
	query := `
		SELECT id, invoice_id, amount, payment_gateway, transaction_id, created_at, updated_at
		FROM payments WHERE id=@id
	`
	row := s.db.QueryRowContext(ctx, query, sql.Named("id", id))

	var p entityPayment.Payment
	err := row.Scan(&p.Id, &p.InvoiceId, &p.Amount, &p.PaymentGateway, &p.TransactionId, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get payment: %v", err)
	}

	return &p, nil
}
