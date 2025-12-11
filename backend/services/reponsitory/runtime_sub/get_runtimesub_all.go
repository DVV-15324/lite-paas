package runtimesub

import (
	"context"

	entityRuntimeSub "lite-paas/services/entity/runtime_sub"
)

func (s *RuntimeSubServiceSQL) ListRuntimeSubsAll(ctx context.Context) ([]*entityRuntimeSub.RuntimeSubscription, error) {
	query := `SELECT id, user_id, service_id, link_return, status, created_at, updated_at FROM user_runtime`
	rows, err := s.db.QueryContext(ctx, query)
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
