package api

import (
	"context"
	entityRuntimeEnv "lite-paas/modules/runtime_env/entity"
	c_errors "lite-paas/shared/errors"
)

type BusinessRuntimeEnv interface {
	BzCreateRuntimeEnv(ctx context.Context, data *entityRuntimeEnv.CreateRuntimeEnv, runtime_id int) *c_errors.AppError
}

type ApiRuntimeEnv struct {
	bz BusinessRuntimeEnv
}

func NewApiDatabaseEnv(bz BusinessRuntimeEnv) *ApiRuntimeEnv {
	return &ApiRuntimeEnv{
		bz: bz,
	}
}
