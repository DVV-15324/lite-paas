package database_sub

import (
	"context"
	"database/sql"
	entityDatabaseSub "lite-paas/modules/database_sub/entity"
)

func (s *DatabaseSubServiceSQL) ListDatabaseSubsByUser(ctx context.Context, userID int64) ([]*entityDatabaseSub.DatabaseSub, error) {
	query := `SELECT id, user_id, service_id, port, link_return, status, created_at, updated_at FROM database_sub WHERE user_id=@user_id`
	rows, err := s.db.QueryContext(ctx, query, sql.Named("user_id", userID))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*entityDatabaseSub.DatabaseSub
	for rows.Next() {
		var sub entityDatabaseSub.DatabaseSub
		if err := rows.Scan(&sub.Id, &sub.UserId, &sub.ServiceId, &sub.Port, &sub.LinkReturn, &sub.Status, &sub.CreatedAt, &sub.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, &sub)
	}
	return list, nil
}
