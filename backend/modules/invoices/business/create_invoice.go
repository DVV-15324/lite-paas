package invoice

import (
	"context"
	entityInvoice "lite-paas/modules/invoices/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (b *BussinessInvoice) BzCreateInvoice(ctx context.Context, inv *entityInvoice.CreateInvoice, user_id int64) (int64, *c_errors.AppError) {
	err := inv.Validate()
	if err != nil {
		app := c_errors.NewAppError(400, http.StatusText(400), err)
		return 0, app
	}
	c, err_inv := b.bz.CreateInvoice(ctx, inv, user_id)
	if err_inv != nil {
		app := c_errors.NewAppError(500, http.StatusText(500), err_inv)
		return 0, app
	}
	return c, nil
}
