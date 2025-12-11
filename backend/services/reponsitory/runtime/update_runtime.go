package runtime

import (
	"context"
	"database/sql"
	"fmt"
	entityRuntime "lite-paas/services/entity/runtime"
	"strings"
)

func (r *RuntimeServiceSQL) UpdateRuntime(ctx context.Context, id int, runtime *entityRuntime.UpdateRuntime) error {
	if runtime == nil {
		return fmt.Errorf("runtime is nill")
	}
	var (
		placeholders []string
		args         []interface{}
	)
	if runtime.Name != nil {
		args = append(args, sql.Named("name", runtime.Name))
		placeholders = append(placeholders, "name=@name")
	}
	if runtime.Description != nil {
		args = append(args, sql.Named("description", runtime.Description))
		placeholders = append(placeholders, "description=@description")
	}
	if runtime.Status != nil {
		args = append(args, sql.Named("status", runtime.Status))
		placeholders = append(placeholders, "status=@status")
	}
	if runtime.Version != nil {
		args = append(args, sql.Named("version", runtime.Version))
		placeholders = append(placeholders, "version=@version")
	}
	if len(placeholders) == 0 {
		return fmt.Errorf("no fields to update")
	}
	query := fmt.Sprintf("UPDATE runtime_services SET %s", strings.Join(placeholders, ", "))
	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failer to update runtime: %v", err)
	}

	return nil
}
