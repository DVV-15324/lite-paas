package ticket_message

import (
	"context"
	entityTicketMessage "lite-paas/services/entity/ticket_message"
)

func (b *BusinessTicketMessage) GetMessagesByTicket(ctx context.Context, ticketID int64) ([]*entityTicketMessage.TicketMessage, error) {
	return b.bz.ListMessages(ctx, ticketID)
}
