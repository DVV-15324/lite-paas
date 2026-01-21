package database

import (
	"context"
	"database/sql"
	entityDatabase "lite-paas/modules/database/entity"
)

func (r *DatabaseServiceSQL) GetDatabaseById(ctx context.Context, id int) (*entityDatabase.DatabaseService, error) {
	query := `
		SELECT id, name, price, description, cpu, ram, storage, version, status, created_at, updated_at,port_container
		FROM databases WHERE id = @id;
	`

	row := r.db.QueryRowContext(ctx, query, sql.Named("id", id))

	database := &entityDatabase.DatabaseService{}

	err := row.Scan(
		&database.Id,
		&database.Name,
		&database.Price,
		&database.Description,
		&database.CPU,
		&database.RAM,
		&database.Storage,
		&database.Version,
		&database.Status,
		&database.CreatedAt,
		&database.UpdatedAt,
		&database.PortContainer,
	)
	if err != nil {
		// Nếu không có row → return nil, nil tùy bạn
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return database, nil
}
