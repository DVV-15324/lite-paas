package ticketmessage

import (
	"context"
	"database/sql"
	entityTicketMessage "lite-paas/services/entity/ticket_message"
)

func (s *TicketMessageServiceSQL) ListMessages(ctx context.Context, ticketID int64) ([]*entityTicketMessage.TicketMessage, error) {
	query := `SELECT id, ticket_id, sender_id, message, created_at, updated_at
			  FROM ticket_messages WHERE ticket_id=@ticket_id ORDER BY created_at ASC`
	rows, err := s.db.QueryContext(ctx, query, sql.Named("ticket_id", ticketID))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*entityTicketMessage.TicketMessage
	for rows.Next() {
		var m entityTicketMessage.TicketMessage
		if err := rows.Scan(&m.Id, &m.TicketID, &m.SenderID, &m.Message, &m.CreatedAt, &m.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, &m)
	}
	return list, nil
}
