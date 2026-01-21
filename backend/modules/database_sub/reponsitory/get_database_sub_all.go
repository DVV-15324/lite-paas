package database_sub

import (
	"context"

	entityDatabaseSub "lite-paas/modules/database_sub/entity"
)

func (s *DatabaseSubServiceSQL) ListDatabaseSubsAll(ctx context.Context) ([]*entityDatabaseSub.DatabaseSub, error) {
	query := `SELECT id, user_id, service_id, port, link_return, status, created_at, updated_at FROM database_sub`
	rows, err := s.db.QueryContext(ctx, query)
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
