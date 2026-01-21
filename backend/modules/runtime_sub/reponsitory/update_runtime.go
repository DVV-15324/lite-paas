package runtimesub

import (
	"context"
	"database/sql"
	"fmt"
	entityRuntimeSub "lite-paas/modules/runtime_sub/entity"
	"strings"
)

func (r *RuntimeSubServiceSQL) UpdateRuntimesub(ctx context.Context, id int, runtime *entityRuntimeSub.UpdateRuntimeSubscription) error {
	if runtime == nil {
		return fmt.Errorf("runtime is nil")
	}

	var (
		setClauses []string
		args       []interface{}
	)

	if runtime.LinkGit != nil {
		setClauses = append(setClauses, "link_git = @link_git")
		args = append(args, sql.Named("link_git", *runtime.LinkGit))
	}
	if runtime.TokenGit != nil {
		setClauses = append(setClauses, "token_git = @token_git")
		args = append(args, sql.Named("token_git", *runtime.TokenGit))
	}

	if len(setClauses) == 0 {
		return fmt.Errorf("no fields to update")
	}

	// Thêm WHERE id = @id
	query := fmt.Sprintf("UPDATE runtime_sub SET %s WHERE id = @id", strings.Join(setClauses, ", "))
	args = append(args, sql.Named("id", id))

	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to update runtime: %v", err)
	}

	return nil
}
