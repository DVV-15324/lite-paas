package storage

import (
	"context"
	"database/sql"
	entityStorage "lite-paas/services/entity/storage"
)

func (r *StorageServiceSQL) GetStorageById(ctx context.Context, id int) (*entityStorage.StorageService, error) {
	query := `
		SELECT id, name, price, description, service_type, cpu, ram, storage, version, status, created_at, updated_at
		FROM storage_services WHERE id = @id;
	`

	row := r.db.QueryRowContext(ctx, query, sql.Named("id", id))

	// Chuẩn bị struct để scan
	storage := &entityStorage.StorageService{}

	err := row.Scan(
		&storage.Id,
		&storage.Name,
		&storage.Price,
		&storage.Description,
		&storage.ServiceType,
		&storage.CPU,
		&storage.RAM,
		&storage.Storage,
		&storage.Version,
		&storage.Status,
		&storage.CreatedAt,
		&storage.UpdatedAt,
	)
	if err != nil {
		// Nếu không có row → return nil, nil tùy bạn
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return storage, nil
}
