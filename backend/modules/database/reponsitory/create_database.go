package database

import (
	"context"
	"database/sql"
	"lite-paas/modules/database/entity"
)

// CREATE
func (r *DatabaseServiceSQL) CreateDatabase(ctx context.Context, s *storage.CreateDatabaseService) error {
	query := `
		INSERT INTO databases (name, price, description, cpu, ram, storage, version, status, port_container) 
		VALUES (@name, @price, @description, @cpu, @ram, @storage, @version, @status, @port_container)
	`
	_, err := r.db.ExecContext(ctx, query,
		sql.Named("name", s.Name),
		sql.Named("price", s.Price),
		sql.Named("description", s.Description),
		sql.Named("cpu", s.CPU),
		sql.Named("ram", s.RAM),
		sql.Named("storage", s.Storage),
		sql.Named("version", s.Version),
		sql.Named("status", s.Status),
		sql.Named("port_container", s.PortContainer),
	)

	return err
}
