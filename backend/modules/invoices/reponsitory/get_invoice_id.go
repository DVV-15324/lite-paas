package invoice

import (
	"context"
	"database/sql"
	"fmt"
	entityInvoice "lite-paas/modules/invoices/entity"
)

func (s *InvoiceServiceSQL) GetInvoiceByID(ctx context.Context, id int64) (*entityInvoice.Invoice, error) {
	query := `SELECT id, user_id, service_id, service_type, amount, status, paid_at, due_date, created_at, updated_at FROM invoices WHERE id=@id`
	row := s.db.QueryRowContext(ctx, query, sql.Named("id", id))

	var inv entityInvoice.Invoice
	err := row.Scan(
		&inv.Id, &inv.UserId, &inv.ServiceID, &inv.ServiceType, &inv.Amount,
		&inv.Status, &inv.PaidAt, &inv.DueDate, &inv.CreatedAt, &inv.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get invoice: %v", err)
	}
	return &inv, nil
}
