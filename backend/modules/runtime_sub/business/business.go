package runtimesub

import (
	entityRuntimeEnv "lite-paas/modules/runtime_env/entity"
	entityRuntimeSub "lite-paas/modules/runtime_sub/entity"
	entityRuntime "lite-paas/modules/runtimes/entity"
	c_errors "lite-paas/shared/errors"

	"context"
	entityUser "lite-paas/modules/users/entity"
)

type RuntimeSubResponsitory interface {
	CreateRuntimeSub(ctx context.Context, sub *entityRuntimeSub.CreateRuntimeSubscription, userName string, user_id int64, service_id int64) (int64, error)
	ListRuntimeSubsByUser(ctx context.Context, userID int64) ([]*entityRuntimeSub.RuntimeSubscription, error)
	UpdateRuntimesub(ctx context.Context, id int, runtime *entityRuntimeSub.UpdateRuntimeSubscription) error
	GetRuntimeSubByID(ctx context.Context, id int64) (*entityRuntimeSub.RuntimeSubscription, error)
	ListRuntimeSubsAll(ctx context.Context) ([]*entityRuntimeSub.RuntimeSubscription, error)
	GetRuntimeSubByLinkGit(ctx context.Context, linkGit string) (*entityRuntimeSub.RuntimeSubscription, error)
}
type BusinessRuntime interface {
	BzGetRuntimeById(ctx context.Context, id int) (*entityRuntime.RuntimeService, *c_errors.AppError)
}

type BusinessRuntimeEnv interface {
	BzGetRuntimeEnvById(ctx context.Context, runtime_id int) (*entityRuntimeEnv.RuntimeEnv, *c_errors.AppError)
}

type RuntimeSubBusiness struct {
	bz           RuntimeSubResponsitory
	bzRuntimeEnv BusinessRuntimeEnv
	bzRuntime    BusinessRuntime

	bzUser BzUser
}
type BzUser interface {
	BzCreateUser(ctx context.Context, cu *entityUser.CreateUserForm) (int, *c_errors.AppError)
	BzGetUsersById(ctx context.Context, id int) (*entityUser.Users, *c_errors.AppError)
}

func NewRuntimeSubBusiness(bz RuntimeSubResponsitory, bzUser BzUser, bzRuntime BusinessRuntime, bzRuntimeEnv BusinessRuntimeEnv) *RuntimeSubBusiness {
	return &RuntimeSubBusiness{
		bz:           bz,
		bzRuntimeEnv: bzRuntimeEnv,
		bzRuntime:    bzRuntime,
		bzUser:       bzUser,
	}
}
