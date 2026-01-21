package database_env

import (
	"context"
	entityDatabaseEnv "lite-paas/modules/database_env/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (b *BusinessDatabaseEnv) BzCreateDatabaseEnv(ctx context.Context, data *entityDatabaseEnv.CreateDatabaseEnv, database_id int) *c_errors.AppError {
	err := data.Validate()
	if err != nil {
		err := c_errors.NewAppError(400, http.StatusText(400), err)
		return err
	}
	_, errCreate := b.bz.CreateDatabaseEnv(ctx, data, database_id)

	if errCreate != nil {
		errCreate := c_errors.NewAppError(500, http.StatusText(500), errCreate)
		return errCreate
	}
	return nil
}
