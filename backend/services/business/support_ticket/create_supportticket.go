package support_ticket

import (
	"context"
	entitySupportTicket "lite-paas/services/entity/support_ticket"
)

func (b *BussinessSuportTicket) CreateNewTicket(ctx context.Context, t *entitySupportTicket.CreateSupportTicket, userId int, serviceId int) (int64, error) {
	if err := t.Validate(); err != nil {
		return 0, err
	}
	return b.bz.CreateTicket(ctx, t, userId, serviceId)
}
