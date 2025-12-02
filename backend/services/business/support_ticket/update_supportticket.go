package support_ticket

import (
	"context"
	entitySuportTicket "lite-paas/services/entity/support_ticket"
)

func (b *BussinessSuportTicket) UpdateTicket(ctx context.Context, t *entitySuportTicket.UpdateSupportTicket, id int) error {
	if err := t.Validate(); err != nil {
		return err
	}
	return b.bz.UpdateTicket(ctx, t, id)
}
