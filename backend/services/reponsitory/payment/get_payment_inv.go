package payment

import (
	"context"
	"database/sql"
	"fmt"
	entityPayment "lite-paas/services/entity/payment"
)

func (s *PaymentServiceSQL) ListPaymentsByInvoice(ctx context.Context, invoiceID int64) ([]*entityPayment.Payment, error) {
	query := `
		SELECT id, invoice_id, amount, payment_gateway, transaction_id, created_at, updated_at
		FROM payments WHERE invoice_id=@invoice_id
	`
	rows, err := s.db.QueryContext(ctx, query, sql.Named("invoice_id", invoiceID))
	if err != nil {
		return nil, fmt.Errorf("failed to list payments: %v", err)
	}
	defer rows.Close()

	var payments []*entityPayment.Payment
	for rows.Next() {
		var p entityPayment.Payment
		if err := rows.Scan(
			&p.Id, &p.InvoiceId, &p.Amount, &p.PaymentGateway, &p.TransactionId, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, err
		}
		payments = append(payments, &p)
	}
	return payments, nil
}
