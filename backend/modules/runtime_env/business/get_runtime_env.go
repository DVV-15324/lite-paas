package runtime_env

import (
	"context"
	entityRuntimeEnv "lite-paas/modules/runtime_env/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (b *BusinessRuntimeEnv) BzGetRuntimeEnvById(ctx context.Context, runtime_id int) (*entityRuntimeEnv.RuntimeEnv, *c_errors.AppError) {
	runtimeEnv, err := b.bz.GetRtEnv(ctx, runtime_id)
	if err != nil {
		app := c_errors.NewAppError(404, http.StatusText(404), err)
		return nil, app
	}

	return runtimeEnv, nil
}
