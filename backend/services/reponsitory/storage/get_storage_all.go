package storage

import (
	"context"
	entityStorage "lite-paas/services/entity/storage"
)

func (r *StorageServiceSQL) GetAllStorage(ctx context.Context) ([]*entityStorage.StorageService, error) {
	query := `
		SELECT id, name, price, description, service_type, cpu, ram, storage, version, status, created_at, updated_at
		FROM storage_services
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*entityStorage.StorageService
	for rows.Next() {
		var s entityStorage.StorageService
		err := rows.Scan(
			&s.Id, &s.Name, &s.Price, &s.Description, &s.ServiceType, &s.CPU, &s.RAM, &s.Storage,
			&s.Version, &s.Status, &s.CreatedAt, &s.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		list = append(list, &s)
	}
	return list, rows.Err()
}
