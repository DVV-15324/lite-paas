package invoice

import (
	"context"

	"fmt"
	entityInvoice "lite-paas/services/entity/invoice"
)

func (s *InvoiceServiceSQL) ListInvoicesAll(ctx context.Context) ([]*entityInvoice.Invoice, error) {
	query := `
		SELECT id, user_id, service_id, service_type, amount, status, paid_at, due_date, created_at, updated_at
		FROM invoices
	`
	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list invoices: %v", err)
	}
	defer rows.Close()

	var invoices []*entityInvoice.Invoice
	for rows.Next() {
		var inv entityInvoice.Invoice
		if err := rows.Scan(
			&inv.Id, &inv.UserId, &inv.ServiceID, &inv.ServiceType, &inv.Amount,
			&inv.Status, &inv.PaidAt, &inv.DueDate, &inv.CreatedAt, &inv.UpdatedAt,
		); err != nil {
			return nil, err
		}
		invoices = append(invoices, &inv)
	}
	return invoices, nil
}
