package runtimesub

import (
	"context"
	"database/sql"
	"fmt"
	entityRuntimeSub "lite-paas/services/entity/runtime_sub"
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
	if runtime.Token != nil {
		setClauses = append(setClauses, "token = @token")
		args = append(args, sql.Named("token", *runtime.Token))
	}

	// Status là bool, không pointer, luôn update
	setClauses = append(setClauses, "status = @status")
	args = append(args, sql.Named("status", runtime.Status))

	if len(setClauses) == 0 {
		return fmt.Errorf("no fields to update")
	}

	// Thêm WHERE id = @id
	query := fmt.Sprintf("UPDATE user_runtime_sub SET %s WHERE id = @id", strings.Join(setClauses, ", "))
	args = append(args, sql.Named("id", id))

	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to update runtime: %v", err)
	}

	return nil
}
