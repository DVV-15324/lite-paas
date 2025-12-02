package storage

import (
	"context"
	"database/sql"
	"lite-paas/services/entity/storage"
)

// CREATE
func (r *StorageServiceSQL) CreateStorage(ctx context.Context, s *storage.CreateStorageService) error {
	query := `
		INSERT INTO storage_services (name, price, description, service_type, cpu, ram, storage, version, status) 
		VALUES (@name, @price, @description, @service_type, @cpu, @ram, @storage, @version, @status)
	`
	_, err := r.db.ExecContext(ctx, query,
		sql.Named("name", s.Name),
		sql.Named("price", s.Price),
		sql.Named("description", s.Description),
		sql.Named("service_type", s.ServiceType),
		sql.Named("cpu", s.CPU),
		sql.Named("ram", s.RAM),
		sql.Named("storage", s.Storage),
		sql.Named("version", s.Version),
		sql.Named("status", s.Status),
	)
	return err
}
