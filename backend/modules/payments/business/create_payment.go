package payment

import (
	"context"
	entityPayment "lite-paas/modules/payments/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (b *BussinessPayment) BzCreateNewPayment(ctx context.Context, p *entityPayment.CreatePayment, invoiceId int64) (int64, *c_errors.AppError) {

	err := p.Validate()
	if err != nil {
		app := c_errors.NewAppError(400, http.StatusText(400), err)
		return 0, app
	}
	c, err_p := b.bz.CreatePayment(ctx, p, invoiceId)
	if err_p != nil {
		app := c_errors.NewAppError(400, http.StatusText(400), err_p)
		return 0, app
	}
	return c, nil
}
