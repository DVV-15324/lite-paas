package invoice

import (
	"context"
	entityInvoice "lite-paas/services/entity/invoice"
)

type BusinessInvoice interface {
	CreateInvoice(ctx context.Context, inv *entityInvoice.CreateInvoice, user_id int64) (int64, error)
	ListInvoicesByUser(ctx context.Context, userID int64) ([]*entityInvoice.Invoice, error)
	GetInvoiceByID(ctx context.Context, id int64) (*entityInvoice.Invoice, error)
	UpdateInvoiceStatus(ctx context.Context, id int64, status string) error
	ListInvoicesAll(ctx context.Context) ([]*entityInvoice.Invoice, error)
}

type ApiInvoice struct {
	bz BusinessInvoice
}

func NewApiInvoice(bz BusinessInvoice) *ApiInvoice {
	return &ApiInvoice{
		bz: bz,
	}
}
