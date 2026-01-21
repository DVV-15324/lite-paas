package database_sub

import (
	"context"
	entityDatabase "lite-paas/modules/database/entity"
	entityDatabaseSub "lite-paas/modules/database_sub/entity"
	entityUser "lite-paas/modules/users/entity"
	c_errors "lite-paas/shared/errors"
)

type DatabaseSubReponsitory interface {
	CreateDatabaseSub(
		ctx context.Context,
		sub *entityDatabaseSub.CreateDatabaseSub,
		user_id int64,
		service_id int64,
	) (insertedID int64, port int, err error)
	ListDatabaseSubsByUser(ctx context.Context, userID int64) ([]*entityDatabaseSub.DatabaseSub, error)
	GetDatabaseSubsById(ctx context.Context, id int64) (*entityDatabaseSub.DatabaseSub, error)
	ListDatabaseSubsAll(ctx context.Context) ([]*entityDatabaseSub.DatabaseSub, error)
}

type BzUser interface {
	BzCreateUser(ctx context.Context, cu *entityUser.CreateUserForm) (int, *c_errors.AppError)
	BzGetUsersById(ctx context.Context, id int) (*entityUser.Users, *c_errors.AppError)
}
type BussinessDatabaseSub struct {
	bz         DatabaseSubReponsitory
	bzDatabase BusinessDatabase
	bzUser     BzUser
}

type BusinessDatabase interface {
	BzGetDatabaseById(ctx context.Context, id int) (*entityDatabase.DatabaseService, *c_errors.AppError)
}

func NewBussinessDatabaseSub(repo DatabaseSubReponsitory, bzUser BzUser, bzDatabase BusinessDatabase) *BussinessDatabaseSub {
	return &BussinessDatabaseSub{
		bz:         repo,
		bzDatabase: bzDatabase,
		bzUser:     bzUser,
	}
}
