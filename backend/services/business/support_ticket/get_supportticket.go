package support_ticket

import (
	"context"
	entitySuportTicket "lite-paas/services/entity/support_ticket"
)

func (b *BussinessSuportTicket) GetTicketsByUserID(ctx context.Context, userId int64) ([]entitySuportTicket.SupportTicket, error) {
	return b.bz.GetTicketsByUserID(ctx, userId)
}
