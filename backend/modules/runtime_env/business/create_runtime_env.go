package runtime_env

import (
	"context"
	entityRuntimeEnv "lite-paas/modules/runtime_env/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (b *BusinessRuntimeEnv) BzCreateRuntimeEnv(ctx context.Context, data *entityRuntimeEnv.CreateRuntimeEnv, runtime_id int) *c_errors.AppError {
	err := data.Validate()
	if err != nil {
		err := c_errors.NewAppError(400, http.StatusText(400), err)
		return err
	}
	_, errCreate := b.bz.CreateRuntimeEnv(ctx, data, runtime_id)

	if errCreate != nil {
		errCreate := c_errors.NewAppError(500, http.StatusText(500), errCreate)
		return errCreate
	}
	return nil
}
