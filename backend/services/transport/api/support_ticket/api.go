package support_ticket

import (
	"context"
	entitySuportTicket "lite-paas/services/entity/support_ticket"
)

type BusinessSupportTicket interface {
	CreateNewTicket(ctx context.Context, t *entitySuportTicket.CreateSupportTicket, userId int, serviceId int) (int64, error)
	GetTicketsByUserID(ctx context.Context, userId int64) ([]entitySuportTicket.SupportTicket, error)
	UpdateTicket(ctx context.Context, t *entitySuportTicket.UpdateSupportTicket, id int) error
}

type ApiSupportTicket struct {
	bz BusinessSupportTicket
}

func NewApiSupportTicket(bz BusinessSupportTicket) *ApiSupportTicket {
	return &ApiSupportTicket{
		bz: bz,
	}
}
