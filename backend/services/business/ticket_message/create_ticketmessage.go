package ticket_message

import (
	"context"
	entityTicketMessage "lite-paas/services/entity/ticket_message"
)

func (b *BusinessTicketMessage) CreateNewMessage(ctx context.Context, msg *entityTicketMessage.CreateTicketMessage, ticketId int, senderId int) error {
	if err := msg.Validate(); err != nil {
		return err
	}
	return b.bz.CreateMessage(ctx, msg, ticketId, senderId)
}
