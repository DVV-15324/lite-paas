package payment

import (
	"context"
	entityPayment "lite-paas/services/entity/payment"
)

func (b *BussinessPayment) GetPaymentsByInvoice(ctx context.Context, invoiceID int64) ([]*entityPayment.Payment, error) {
	return b.bz.ListPaymentsByInvoice(ctx, invoiceID)
}
