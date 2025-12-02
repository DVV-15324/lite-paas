package runtime

import (
	"context"
	"database/sql"
	entityRuntime "lite-paas/services/entity/runtime"
)

func (r *RuntimeServiceSQL) GetRuntimeById(ctx context.Context, id int) (*entityRuntime.RuntimeService, error) {
	query := `
		SELECT 
			id, name, price, description, version, cpu, ram, storage, status, created_at, updated_at 
		FROM runtime_services 
		WHERE id = @id;
	`

	row := r.db.QueryRowContext(ctx, query, sql.Named("id", id))

	// Chuẩn bị struct để scan
	runtime := &entityRuntime.RuntimeService{}

	err := row.Scan(
		&runtime.Id,
		&runtime.Name,
		&runtime.Price,
		&runtime.Description,
		&runtime.Version,
		&runtime.CPU,
		&runtime.RAM,
		&runtime.Storage,
		&runtime.Status,
		&runtime.CreatedAt,
		&runtime.UpdatedAt,
	)

	if err != nil {
		// Nếu không có row → return nil, nil tùy bạn
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return runtime, nil
}
