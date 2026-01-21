package database_env

import (
	"context"
	"database/sql"
	entityDatabaseEnv "lite-paas/modules/database_env/entity"
)

func (d *DatabaseEnvServiceSQL) GetDbEnv(ctx context.Context, database_id int) (*entityDatabaseEnv.DatabaseEnv, error) {

	data := &entityDatabaseEnv.DatabaseEnv{}

	query := `
		SELECT 
			id,
			database_id,
			env_keys,
			created_at,
			updated_at
		FROM database_env
		WHERE database_id = @database_id
	`

	err := d.db.QueryRowContext(ctx, query, sql.Named("database_id", database_id)).Scan(
		&data.Id,
		&data.DatabaseId,
		&data.EnvKeys,
		&data.CreatedAt,
		&data.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return data, nil
}
