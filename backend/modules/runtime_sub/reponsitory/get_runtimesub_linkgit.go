package runtimesub

import (
	"context"
	"database/sql"

	entityRuntimeSub "lite-paas/modules/runtime_sub/entity"
)

func (s *RuntimeSubServiceSQL) GetRuntimeSubByLinkGit(ctx context.Context, linkGit string) (*entityRuntimeSub.RuntimeSubscription, error) {

	query := `SELECT id, user_id, service_id, link_git, token_git, link_return, status, created_at, updated_at FROM runtime_sub WHERE link_git=@link_git`
	row := s.db.QueryRowContext(ctx, query, sql.Named("link_git", linkGit))

	var sub entityRuntimeSub.RuntimeSubscription
	err := row.Scan(&sub.Id, &sub.UserId, &sub.ServiceId, &sub.LinkGit, &sub.TokenGit, &sub.LinkReturn, &sub.Status, &sub.CreatedAt, &sub.UpdatedAt)
	if err != nil {

		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &sub, nil
}
