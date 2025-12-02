package support_ticket

import (
	"context"
	"database/sql"
	entitySupportTicket "lite-paas/services/entity/support_ticket"
)

func (s *SupportTicketServiceSQL) GetTicketsByUserID(ctx context.Context, userId int64) ([]entitySupportTicket.SupportTicket, error) {
	query := `
		SELECT id, user_id, service_sub_id, service_type, title, content, status, created_at, updated_at
		FROM support_tickets
		WHERE user_id = @user_id
	`

	rows, err := s.db.QueryContext(ctx, query, sql.Named("user_id", userId))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tickets := []entitySupportTicket.SupportTicket{}

	for rows.Next() {
		var t entitySupportTicket.SupportTicket

		err := rows.Scan(
			&t.Id, &t.UserID, &t.ServiceSubID, &t.ServiceType, &t.Title,
			&t.Content, &t.Status,
			&t.CreatedAt, &t.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		tickets = append(tickets, t)
	}

	// Check lỗi vòng lặp
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return tickets, nil
}
