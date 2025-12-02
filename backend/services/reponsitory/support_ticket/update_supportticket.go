package support_ticket

import (
	"context"
	"database/sql"
	entitySuportTicket "lite-paas/services/entity/support_ticket"
)

func (s *SupportTicketServiceSQL) UpdateTicket(ctx context.Context, t *entitySuportTicket.UpdateSupportTicket, id int) error {
	query := `
		UPDATE support_tickets
		SET status=@status, priority=@priority, updated_at=GETDATE()
		WHERE id=@id
	`
	_, err := s.db.ExecContext(ctx, query,
		sql.Named("status", t.Status),
		sql.Named("priority", t.Priority),
		sql.Named("id", id),
	)
	return err
}
