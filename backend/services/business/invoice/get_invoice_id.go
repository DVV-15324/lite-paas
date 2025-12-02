package invoice

import (
	"context"
	entityInvoice "lite-paas/services/entity/invoice"
)

func (b *BussinessInvoice) GetInvoiceByID(ctx context.Context, id int64) (*entityInvoice.Invoice, error) {
	return b.bz.GetInvoiceByID(ctx, id)
}
