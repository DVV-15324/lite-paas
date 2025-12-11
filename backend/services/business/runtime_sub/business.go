package runtimesub

import (
	c_errors "lite-paas/common/errors"
	hub "lite-paas/common/hub"
	entityRuntime "lite-paas/services/entity/runtime"
	entityRuntimeSub "lite-paas/services/entity/runtime_sub"

	"context"
	entityUser "lite-paas/services/entity/user"
)

type RuntimeSubResponsitory interface {
	CreateRuntimeSub(ctx context.Context, sub *entityRuntimeSub.CreateRuntimeSubscription, userName string, user_id int64, service_id int64) (int64, error)
	ListRuntimeSubsByUser(ctx context.Context, userID int64) ([]*entityRuntimeSub.RuntimeSubscription, error)
	UpdateRuntimesub(ctx context.Context, id int, runtime *entityRuntimeSub.UpdateRuntimeSubscription) error
	GetRuntimeSubByID(ctx context.Context, id int64) (*entityRuntimeSub.RuntimeSubscription, error)
	ListRuntimeSubsAll(ctx context.Context) ([]*entityRuntimeSub.RuntimeSubscription, error)
}
type BusinessRuntime interface {
	GetRuntimeById(ctx context.Context, id int) (*entityRuntime.RuntimeService, error)
}

type RuntimeSubBusiness struct {
	bz        RuntimeSubResponsitory
	hub       *hub.ServiceHub
	bzRuntime BusinessRuntime

	bzUser BzUser
}
type BzUser interface {
	BzCreateUser(ctx context.Context, cu *entityUser.CreateUserForm) (int, *c_errors.AppError)
	BzGetUsersById(ctx context.Context, id int) (*entityUser.Users, *c_errors.AppError)
}

func NewRuntimeSubBusiness(bz RuntimeSubResponsitory, hub *hub.ServiceHub, bzUser BzUser, bzRuntime BusinessRuntime) *RuntimeSubBusiness {
	return &RuntimeSubBusiness{
		bz:        bz,
		hub:       hub,
		bzRuntime: bzRuntime,
		bzUser:    bzUser,
	}
}
