package invoice

import (
	"context"
	"database/sql"
	"fmt"
	entityInvoice "lite-paas/modules/invoices/entity"
)

func (s *InvoiceServiceSQL) CreateInvoice(ctx context.Context, inv *entityInvoice.CreateInvoice, user_id int64) (int64, error) {
	query := `
		INSERT INTO invoices (user_id, service_id, payment_method, service_type, amount, status, due_date)
		OUTPUT INSERTED.id
		VALUES (@user_id, @service_id, @payment_method, @service_type, @amount, @status, @due_date)
	`

	var id int64
	err := s.db.QueryRowContext(ctx, query,
		sql.Named("user_id", user_id),
		sql.Named("service_id", inv.ServiceID),
		sql.Named("payment_method", inv.PaymentMethod),
		sql.Named("service_type", inv.ServiceType),
		sql.Named("amount", inv.Amount),
		sql.Named("status", 0),
		sql.Named("due_date", inv.DueDate),
	).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("failed to create invoice: %v", err)
	}

	return id, nil
}
