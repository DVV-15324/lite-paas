package database_sub

import (
	"context"
	entityDatabaseSub "lite-paas/modules/database_sub/entity"
	c_errors "lite-paas/shared/errors"
)

type BusinessDatabaseSub interface {
	BzCreateNewDatabaseSub(ctx context.Context, sub *entityDatabaseSub.CreateDatabaseSub, user_id int64, service_id int64) (int64, int, *c_errors.AppError)

	BzGetDatabaseSubsByUser(ctx context.Context, userID int64) ([]*entityDatabaseSub.DatabaseSub, *c_errors.AppError)

	BzGetDatabaseSubsById(ctx context.Context, id int64, userId int64) (*entityDatabaseSub.DatabaseSub, *c_errors.AppError)
	BzGetDatabaseSubsAll(ctx context.Context) ([]*entityDatabaseSub.DatabaseSub, *c_errors.AppError)
}

type ApiDatabaseSub struct {
	bz BusinessDatabaseSub
}

func NewApiDatabaseSub(bz BusinessDatabaseSub) *ApiDatabaseSub {
	return &ApiDatabaseSub{
		bz: bz,
	}
}
