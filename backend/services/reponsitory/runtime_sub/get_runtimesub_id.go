package runtimesub

import (
	"context"
	"database/sql"
	entityRuntimeSub "lite-paas/services/entity/runtime_sub"
)

func (s *RuntimeSubServiceSQL) GetRuntimeSubByID(ctx context.Context, id int64) (*entityRuntimeSub.RuntimeSubscription, error) {
	query := `SELECT id, user_id, service_id, link_git, token, link_return, status, created_at, updated_at FROM user_runtime WHERE id=@id`
	row := s.db.QueryRowContext(ctx, query, sql.Named("id", id))

	var sub entityRuntimeSub.RuntimeSubscription
	err := row.Scan(&sub.Id, &sub.UserId, &sub.ServiceId, &sub.LinkGit, &sub.Token, &sub.LinkReturn, &sub.Status, &sub.CreatedAt, &sub.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &sub, nil
}
