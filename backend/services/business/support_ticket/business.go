package support_ticket

import (
	"context"
	entitySuportTicket "lite-paas/services/entity/support_ticket"
)

type SuportTickReponsitory interface {
	CreateTicket(ctx context.Context, t *entitySuportTicket.CreateSupportTicket, userId int, serviceid int) (int64, error)
	GetTicketsByUserID(ctx context.Context, userId int64) ([]entitySuportTicket.SupportTicket, error)
	UpdateTicket(ctx context.Context, t *entitySuportTicket.UpdateSupportTicket, id int) error
}
type BussinessSuportTicket struct {
	bz SuportTickReponsitory
}

func NewBussinessSuportTicket(repo SuportTickReponsitory) *BussinessSuportTicket {
	return &BussinessSuportTicket{
		bz: repo,
	}
}
