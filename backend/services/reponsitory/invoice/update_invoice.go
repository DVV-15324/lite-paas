package invoice

import (
	"context"
	"database/sql"
	"fmt"
)

func (s *InvoiceServiceSQL) UpdateInvoiceStatus(ctx context.Context, id int64, status string) error {
	query := `
		UPDATE invoices
		SET status=@status, updated_at=GETDATE()
		WHERE id=@id
	`
	_, err := s.db.ExecContext(ctx, query,
		sql.Named("status", status),
		sql.Named("id", id),
	)
	if err != nil {
		return fmt.Errorf("failed to update invoice: %v", err)
	}
	return nil
}
