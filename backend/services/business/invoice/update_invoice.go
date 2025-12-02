package invoice

import (
	"context"
)

func (b *BussinessInvoice) UpdateInvoiceStatus(ctx context.Context, id int64, status string) error {
	return b.bz.UpdateInvoiceStatus(ctx, id, status)
}
