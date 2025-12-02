package payment

import (
	"context"
	entityPayment "lite-paas/services/entity/payment"
)

func (b *BussinessPayment) GetPaymentDetail(ctx context.Context, id int64) (*entityPayment.Payment, error) {
	return b.bz.GetPaymentByID(ctx, id)
}
