package runtime

import (
	"context"
	"database/sql"
	entityRuntime "lite-paas/services/entity/runtime"
)

func (r *RuntimeServiceSQL) CreateRuntime(ctx context.Context, runtime *entityRuntime.CreateRuntime) error {
	query := `
        INSERT INTO runtime_services(
            name, price, cpu, ram, storage, 
            description, version, status
        ) 
        VALUES (
            @name, @price, @cpu, @ram, @storage, 
            @description, @version, @status
        )`

	_, err := r.db.ExecContext(ctx, query,
		sql.Named("name", runtime.Name),
		sql.Named("price", runtime.Price),
		sql.Named("cpu", runtime.CPU),
		sql.Named("ram", runtime.RAM),
		sql.Named("storage", runtime.Storage),
		sql.Named("description", runtime.Description),
		sql.Named("version", runtime.Version),
		sql.Named("status", runtime.Status),
	)
	if err != nil {
		return err
	}
	return nil
}
