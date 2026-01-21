package invoice

import (
	"context"
	entityInvoice "lite-paas/modules/invoices/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (b *BussinessInvoice) BzGetInvoiceByID(ctx context.Context, id int64) (*entityInvoice.Invoice, *c_errors.AppError) {
	inv, err := b.bz.GetInvoiceByID(ctx, id)
	if err != nil {
		app := c_errors.NewAppError(404, http.StatusText(404), err)
		return nil, app
	}

	return inv, nil
}
