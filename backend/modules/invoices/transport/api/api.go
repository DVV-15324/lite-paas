package invoice

import (
	"context"
	entityInvoice "lite-paas/modules/invoices/entity"
	c_errors "lite-paas/shared/errors"
)

type BusinessInvoice interface {
	BzCreateInvoice(ctx context.Context, inv *entityInvoice.CreateInvoice, user_id int64) (int64, *c_errors.AppError)
	BzListInvoicesByUser(ctx context.Context, userID int64) ([]*entityInvoice.Invoice, *c_errors.AppError)
	BzGetInvoiceByID(ctx context.Context, id int64) (*entityInvoice.Invoice, *c_errors.AppError)
	BzUpdateInvoiceStatus(ctx context.Context, id int64) *c_errors.AppError
	BzListInvoicesAll(ctx context.Context) ([]*entityInvoice.Invoice, *c_errors.AppError)
}

type ApiInvoice struct {
	bz BusinessInvoice
}

func NewApiInvoice(bz BusinessInvoice) *ApiInvoice {
	return &ApiInvoice{
		bz: bz,
	}
}
