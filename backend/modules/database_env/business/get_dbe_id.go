package database_env

import (
	"context"

	entityDatabaseEnv "lite-paas/modules/database_env/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (b *BusinessDatabaseEnv) BzGetDatabaseEnvById(ctx context.Context, id int) (*entityDatabaseEnv.DatabaseEnv, *c_errors.AppError) {
	dbEnv, err := b.bz.GetDbEnv(ctx, id)
	if err != nil {
		app := c_errors.NewAppError(404, http.StatusText(404), err)
		return nil, app
	}

	return dbEnv, nil
}
