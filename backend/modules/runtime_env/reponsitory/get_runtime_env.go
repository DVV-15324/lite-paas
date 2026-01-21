package runtime_env

import (
	"context"
	"database/sql"
	entityRuntimeEnv "lite-paas/modules/runtime_env/entity"
)

func (d *RuntimeEnvSeviceSQL) GetRtEnv(ctx context.Context, runtime_id int) (*entityRuntimeEnv.RuntimeEnv, error) {

	data := entityRuntimeEnv.RuntimeEnv{}

	query := `
		SELECT 
			id,
			runtime_id,
			docker_file,
			created_at,
			updated_at
		FROM runtime_env
		WHERE runtime_id = @runtime_id
	`

	err := d.db.QueryRowContext(ctx, query, sql.Named("runtime_id", runtime_id)).Scan(
		&data.Id,
		&data.RuntimeId,
		&data.DockerFile,
		&data.CreatedAt,
		&data.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &data, nil
}
