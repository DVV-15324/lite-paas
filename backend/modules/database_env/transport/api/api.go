package api

import (
	"context"
	entityDatabaseEnv "lite-paas/modules/database_env/entity"
	c_errors "lite-paas/shared/errors"
)

type BusinessDatabaseEnv interface {
	BzCreateDatabaseEnv(ctx context.Context, data *entityDatabaseEnv.CreateDatabaseEnv, database_id int) *c_errors.AppError
}

type ApiDatabaseEnv struct {
	bz BusinessDatabaseEnv
}

func NewApiDatabaseEnv(bz BusinessDatabaseEnv) *ApiDatabaseEnv {
	return &ApiDatabaseEnv{
		bz: bz,
	}
}
