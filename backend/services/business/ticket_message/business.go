package ticket_message

import (
	"context"
	entityTicketMessage "lite-paas/services/entity/ticket_message"
)

type TickMessageReponsitory interface {
	CreateMessage(ctx context.Context, msg *entityTicketMessage.CreateTicketMessage, ticketId int, senderId int) error
	ListMessages(ctx context.Context, ticketID int64) ([]*entityTicketMessage.TicketMessage, error)
}
type BusinessTicketMessage struct {
	bz TickMessageReponsitory
}

func NewBussinessTickMessage(repo TickMessageReponsitory) *BusinessTicketMessage {
	return &BusinessTicketMessage{
		bz: repo,
	}
}
