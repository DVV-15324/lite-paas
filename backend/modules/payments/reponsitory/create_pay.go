package payment

import (
	"context"
	"database/sql"
	"fmt"
	entityPayment "lite-paas/modules/payments/entity"
)

func (s *PaymentServiceSQL) CreatePayment(ctx context.Context, p *entityPayment.CreatePayment, invoiceId int64) (int64, error) {
	// Kiểm tra transaction_id đã tồn tại chưa
	var existingID int64
	err := s.db.QueryRowContext(ctx, `
        SELECT id FROM payments WHERE transaction_id = @transaction_id
    `, sql.Named("transaction_id", p.TransactionID)).Scan(&existingID)

	if err != nil && err != sql.ErrNoRows {
		return 0, fmt.Errorf("failed to check existing payment: %v", err)
	}

	if existingID != 0 {
		// Transaction đã tồn tại → bỏ qua, trả về ID cũ
		return existingID, nil
	}

	// Insert mới với OUTPUT để lấy ID (SQL Server)
	query := `
        INSERT INTO payments (invoice_id, amount, payment_gateway, transaction_id)
        OUTPUT INSERTED.id
        VALUES (@invoice_id, @amount, @payment_gateway, @transaction_id)
    `

	var id int64
	err = s.db.QueryRowContext(ctx, query,
		sql.Named("invoice_id", invoiceId),
		sql.Named("amount", p.Amount),
		sql.Named("payment_gateway", p.PaymentGateway),
		sql.Named("transaction_id", p.TransactionID),
	).Scan(&id)

	if err != nil {
		return 0, fmt.Errorf("failed to create payment: %v", err)
	}

	return id, nil
}
