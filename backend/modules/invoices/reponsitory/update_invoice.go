package invoice

import (
	"context"
	"database/sql"
	"fmt"
)

func (s *InvoiceServiceSQL) UpdateInvoiceStatus(ctx context.Context, id int64) error {
	query := `
		UPDATE invoices
		SET status=@status, updated_at=GETDATE()
		WHERE id=@id
	`
	_, err := s.db.ExecContext(ctx, query,
		sql.Named("status", 1),
		sql.Named("id", id),
	)
	if err != nil {
		return fmt.Errorf("failed to update invoice: %v", err)
	}
	return nil
}
