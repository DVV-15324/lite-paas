package ticketmessage

import (
	"context"
	"database/sql"
	entityTicketMessage "lite-paas/services/entity/ticket_message"
	"time"
)

func (s *TicketMessageServiceSQL) CreateMessage(ctx context.Context, msg *entityTicketMessage.CreateTicketMessage, ticketId int, senderId int) error {
	query := `
		INSERT INTO ticket_messages (ticket_id, sender_id, message, created_at, updated_at)
		VALUES (@ticket_id, @sender_id, @message, @created_at, @updated_at)
	`

	_, err := s.db.ExecContext(ctx, query,
		sql.Named("ticket_id", ticketId),
		sql.Named("sender_id", senderId),
		sql.Named("message", msg.Message),

		sql.Named("created_at", time.Now()),
		sql.Named("updated_at", time.Now()),
	)
	if err != nil {
		return err
	}

	return nil
}
