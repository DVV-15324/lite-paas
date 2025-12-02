package support_ticket

import (
	"context"
	"database/sql"
	"fmt"
	entitySuportTicket "lite-paas/services/entity/support_ticket"
)

func (s *SupportTicketServiceSQL) CreateTicket(ctx context.Context, t *entitySuportTicket.CreateSupportTicket, userId int, serviceid int) (int64, error) {
	query := `
		INSERT INTO support_tickets (user_id, service_sub_id, service_type, title, content, status)
		OUTPUT INSERTED.id
		VALUES (@user_id, @service_sub_id, @service_type, @title, @content, @status)
	`

	var id int64
	err := s.db.QueryRowContext(ctx, query,
		sql.Named("user_id", userId),
		sql.Named("service_sub_id", serviceid),
		sql.Named("service_type", t.ServiceType),
		sql.Named("title", t.Title),
		sql.Named("content", t.Content),
		sql.Named("status", t.Status),
	).Scan(&id)

	if err != nil {
		return 0, fmt.Errorf("create ticket failed: %v", err)
	}
	return id, nil
}
