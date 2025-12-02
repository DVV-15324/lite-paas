package payment

import (
	entityPayment "lite-paas/services/entity/payment"

	"context"
)

func (b *BussinessPayment) CreateNewPayment(ctx context.Context, p *entityPayment.CreatePayment, invoiceId int64) (int64, error) {

	if err := p.Validate(); err != nil {
		return 0, err
	}
	_, err_p := b.bz.CreatePayment(ctx, p, invoiceId)
	if err_p != nil {
		return 0, err_p
	}
	return b.bz.CreatePayment(ctx, p, invoiceId)
}
