package runtime_env

import (
	"context"
	"database/sql"
	"fmt"
	entityRuntimeEnv "lite-paas/modules/runtime_env/entity"
)

func (s *RuntimeEnvSeviceSQL) CreateRuntimeEnv(ctx context.Context, rte *entityRuntimeEnv.CreateRuntimeEnv, runtime_id int) (int64, error) {
	query := `
		INSERT INTO runtime_env (runtime_id, docker_file)
		OUTPUT INSERTED.id
		VALUES (@runtime_id, @docker_file)
	`

	var uid int64
	err := s.db.QueryRowContext(ctx, query,
		sql.Named("runtime_id", runtime_id),
		sql.Named("docker_file", rte.DockerFile),
	).Scan(&uid)
	if err != nil {
		return 0, fmt.Errorf("failed to create rte: %v", err)
	}

	return uid, nil
}
