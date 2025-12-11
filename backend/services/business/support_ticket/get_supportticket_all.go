package support_ticket

import (
	"context"
	entitySuportTicket "lite-paas/services/entity/support_ticket"
)

func (b *BussinessSuportTicket) GetTicketsAll(ctx context.Context) ([]entitySuportTicket.SupportTicket, error) {
	return b.bz.GetTicketsAll(ctx)
}
