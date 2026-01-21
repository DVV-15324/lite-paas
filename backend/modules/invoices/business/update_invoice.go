package invoice

import (
	"context"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (b *BussinessInvoice) BzUpdateInvoiceStatus(ctx context.Context, id int64) *c_errors.AppError {
	err := b.bz.UpdateInvoiceStatus(ctx, id)
	if err != nil {
		app := c_errors.NewAppError(500, http.StatusText(500), err)
		return app
	}
	return nil

}
