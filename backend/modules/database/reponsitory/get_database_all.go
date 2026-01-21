package database

import (
	"context"
	entityStorage "lite-paas/modules/database/entity"
)

func (r *DatabaseServiceSQL) GetAllDatabase(ctx context.Context) ([]*entityStorage.DatabaseService, error) {
	query := `
		SELECT id, name, price, description, cpu, ram, storage, version, status, created_at, updated_at, port_container
		FROM databases;
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*entityStorage.DatabaseService
	for rows.Next() {
		var s entityStorage.DatabaseService
		err := rows.Scan(
			&s.Id, &s.Name, &s.Price, &s.Description, &s.CPU, &s.RAM, &s.Storage,
			&s.Version, &s.Status, &s.CreatedAt, &s.UpdatedAt, &s.PortContainer,
		)
		if err != nil {
			return nil, err
		}
		list = append(list, &s)
	}
	return list, rows.Err()
}
