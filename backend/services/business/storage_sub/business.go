package storagesub

import (
	"context"
	c_errors "lite-paas/common/errors"
	entityStorage "lite-paas/services/entity/storage"
	entityStorageSub "lite-paas/services/entity/storage_sub"
	entityUser "lite-paas/services/entity/user"
)

type StorageSubReponsitory interface {
	CreateStorageSub(
		ctx context.Context,
		sub *entityStorageSub.CreateStorageSubscription,
		user_id int64,
		service_id int64,
		needPortTwo bool,
	) (insertedID int64, portOne int, portTwo int, err error)
	ListStorageSubsByUser(ctx context.Context, userID int64) ([]*entityStorageSub.StorageSubscription, error)
	GetStorageSubsById(ctx context.Context, id int64) (*entityStorageSub.StorageSubscription, error)
	ListStorageSubsAll(ctx context.Context) ([]*entityStorageSub.StorageSubscription, error)
}

type BzUser interface {
	BzCreateUser(ctx context.Context, cu *entityUser.CreateUserForm) (int, *c_errors.AppError)
	BzGetUsersById(ctx context.Context, id int) (*entityUser.Users, *c_errors.AppError)
}
type BussinessStorageSub struct {
	bz        StorageSubReponsitory
	bzStorage BusinessStorage
	bzUser    BzUser
}

type BusinessStorage interface {
	GetStorageById(ctx context.Context, id int) (*entityStorage.StorageService, error)
}

func NewBussinessStorage(repo StorageSubReponsitory, bzUser BzUser, bzStorage BusinessStorage) *BussinessStorageSub {
	return &BussinessStorageSub{
		bz:        repo,
		bzStorage: bzStorage,
		bzUser:    bzUser,
	}
}
