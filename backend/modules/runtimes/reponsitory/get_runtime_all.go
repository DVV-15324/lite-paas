package runtime

import (
	"context"
	entityRuntime "lite-paas/modules/runtimes/entity"
)

func (r *RuntimeServiceSQL) GetAllRuntime(ctx context.Context) ([]*entityRuntime.RuntimeService, error) {
	query := `
		SELECT 
			id, name, price, description, version, cpu, ram, storage, status, created_at, updated_at 
		FROM runtimes WHERE status != 0;;
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var listRuntime []*entityRuntime.RuntimeService

	for rows.Next() {
		var runtime entityRuntime.RuntimeService

		err := rows.Scan(
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
			return nil, err
		}
		listRuntime = append(listRuntime, &runtime)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return listRuntime, nil
}
