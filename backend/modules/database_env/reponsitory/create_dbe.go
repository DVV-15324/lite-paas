package database_env

import (
	"context"
	"database/sql"
	"fmt"
	entityDatabaseEnv "lite-paas/modules/database_env/entity"
)

func (s *DatabaseEnvServiceSQL) CreateDatabaseEnv(ctx context.Context, dbe *entityDatabaseEnv.CreateDatabaseEnv, database_id int) (int64, error) {
	query := `
		INSERT INTO database_env (database_id, env_keys)
		OUTPUT INSERTED.id
		VALUES (@database_id, @env_keys)
	`

	var uid int64
	err := s.db.QueryRowContext(ctx, query,
		sql.Named("database_id", database_id),
		sql.Named("env_keys", dbe.EnvKeys),
	).Scan(&uid)
	if err != nil {
		return 0, fmt.Errorf("failed to create dbe: %v", err)
	}

	return uid, nil
}
