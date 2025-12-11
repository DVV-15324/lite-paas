package runtimesub

import (
	entityRuntimeSub "lite-paas/services/entity/runtime_sub"

	"context"
)

type BusinessRuntimeSub interface {
	GetRuntimeSubsByUser(ctx context.Context, userID int64) ([]*entityRuntimeSub.RuntimeSubscription, error)
	UpdateRuntimeSub(ctx context.Context, id int, idUser int, data *entityRuntimeSub.UpdateRuntimeSubscription, namepace string, baseDomain string) error
	GetRuntimeSubsById(ctx context.Context, id int64) (*entityRuntimeSub.RuntimeSubscription, error)
	GetRuntimeSubsAll(ctx context.Context) ([]*entityRuntimeSub.RuntimeSubscription, error)
}

type ApiRuntimeSub struct {
	bz BusinessRuntimeSub
}

func NewApiRuntimeSub(bz BusinessRuntimeSub) *ApiRuntimeSub {
	return &ApiRuntimeSub{
		bz: bz,
	}
}
