package runtimesub

import (
	"context"
	"database/sql"
	entityRuntimeSub "lite-paas/modules/runtime_sub/entity"
)

func (s *RuntimeSubServiceSQL) ListRuntimeSubsByUser(ctx context.Context, userID int64) ([]*entityRuntimeSub.RuntimeSubscription, error) {
	query := `SELECT id, user_id, service_id, link_return, status, created_at, updated_at FROM runtime_sub WHERE user_id=@user_id`
	rows, err := s.db.QueryContext(ctx, query, sql.Named("user_id", userID))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*entityRuntimeSub.RuntimeSubscription
	for rows.Next() {
		var sub entityRuntimeSub.RuntimeSubscription
		if err := rows.Scan(&sub.Id, &sub.UserId, &sub.ServiceId, &sub.LinkReturn, &sub.Status, &sub.CreatedAt, &sub.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, &sub)
	}
	return list, nil
}
