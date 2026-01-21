package runtimesub

import (
	"context"
	entityRuntimeSub "lite-paas/modules/runtime_sub/entity"
	c_errors "lite-paas/shared/errors"
)

type BusinessRuntimeSub interface {
	BzGetRuntimeSubsByUser(ctx context.Context, userID int64) ([]*entityRuntimeSub.RuntimeSubscription, *c_errors.AppError)
	BzUpdateRuntimeSub(ctx context.Context, id int, idUser int, data *entityRuntimeSub.UpdateRuntimeSubscription, namepace string, baseDomain string) *c_errors.AppError
	BzGetRuntimeSubsById(ctx context.Context, id int64) (*entityRuntimeSub.RuntimeSubscription, *c_errors.AppError)
	BzGetRuntimeSubsAll(ctx context.Context) ([]*entityRuntimeSub.RuntimeSubscription, *c_errors.AppError)
}

type ApiRuntimeSub struct {
	bz BusinessRuntimeSub
}

func NewApiRuntimeSub(bz BusinessRuntimeSub) *ApiRuntimeSub {
	return &ApiRuntimeSub{
		bz: bz,
	}
}
