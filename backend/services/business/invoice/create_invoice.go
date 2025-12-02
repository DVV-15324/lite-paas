package invoice

import (
	"context"
	entityInvoice "lite-paas/services/entity/invoice"
)

func (b *BussinessInvoice) CreateInvoice(ctx context.Context, inv *entityInvoice.CreateInvoice, user_id int64) (int64, error) {
	if err := inv.Validate(); err != nil {
		return 0, err
	}
	return b.bz.CreateInvoice(ctx, inv, user_id)
}
