package storagesub

import (
	"context"
	"database/sql"
	"fmt"
	entityStorageSub "lite-paas/services/entity/storage_sub"
	"strings"
)

func (r *StorageSubServiceSQL) UpdateStoragesub(ctx context.Context, id int, storage *entityStorageSub.UpdateStorageSubscription) error {
	if storage == nil {
		return fmt.Errorf("storage is nil")
	}

	var (
		setClauses []string
		args       []interface{}
	)

	// Status là bool, không pointer, luôn update
	setClauses = append(setClauses, "status = @status")
	args = append(args, sql.Named("status", storage.Status))

	if len(setClauses) == 0 {
		return fmt.Errorf("no fields to update")
	}

	// Thêm WHERE id = @id
	query := fmt.Sprintf("UPDATE user_storage SET %s WHERE id = @id", strings.Join(setClauses, ", "))
	args = append(args, sql.Named("id", id))

	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to update runtime: %v", err)
	}

	return nil
}
