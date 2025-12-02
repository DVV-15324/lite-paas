package ticket_message

import (
	"context"
	entityTicketMessage "lite-paas/services/entity/ticket_message"
)

type BusinessTicketMessage interface {
	GetMessagesByTicket(ctx context.Context, ticketID int64) ([]*entityTicketMessage.TicketMessage, error)
}

type ApiTicketMessage struct {
	bz BusinessTicketMessage
}

func NewApiTicketMessage(bz BusinessTicketMessage) *ApiTicketMessage {
	return &ApiTicketMessage{
		bz: bz,
	}
}
