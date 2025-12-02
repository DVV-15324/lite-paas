package storage

import (
	"context"
	"database/sql"
	"fmt"
	entityStorage "lite-paas/services/entity/storage"
	"strings"
)

func (r *StorageServiceSQL) UpdateStorage(ctx context.Context, id int, s *entityStorage.UpdateStorageService) error {
	if s == nil {
		return fmt.Errorf("storage is nil")
	}

	var (
		setClauses []string
		args       []interface{}
	)

	if s.Name != nil {
		setClauses = append(setClauses, "name=@name")
		args = append(args, sql.Named("name", *s.Name))
	}
	if s.Price != nil {
		setClauses = append(setClauses, "price=@price")
		args = append(args, sql.Named("price", *s.Price))
	}
	if s.Description != nil {
		setClauses = append(setClauses, "description=@description")
		args = append(args, sql.Named("description", *s.Description))
	}
	if s.ServiceType != nil {
		setClauses = append(setClauses, "service_type=@service_type")
		args = append(args, sql.Named("service_type", *s.ServiceType))
	}
	if s.CPU != nil {
		setClauses = append(setClauses, "cpu=@cpu")
		args = append(args, sql.Named("cpu", *s.CPU))
	}
	if s.RAM != nil {
		setClauses = append(setClauses, "ram=@ram")
		args = append(args, sql.Named("ram", *s.RAM))
	}
	if s.Storage != nil {
		setClauses = append(setClauses, "storage=@storage")
		args = append(args, sql.Named("storage", *s.Storage))
	}
	if s.Version != nil {
		setClauses = append(setClauses, "version=@version")
		args = append(args, sql.Named("version", *s.Version))
	}
	if s.Status != nil {
		setClauses = append(setClauses, "status=@status")
		args = append(args, sql.Named("status", *s.Status))
	}

	if len(setClauses) == 0 {
		return fmt.Errorf("no fields to update")
	}

	query := fmt.Sprintf("UPDATE storage_services SET %s WHERE id=@id", strings.Join(setClauses, ", "))
	args = append(args, sql.Named("id", id))

	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to update storage: %v", err)
	}
	return nil
}
