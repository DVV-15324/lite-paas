package storagesub

import (
	"context"
	entityStorageSub "lite-paas/services/entity/storage_sub"
)

type BusinessStorageSub interface {
	CreateNewStorageSub(ctx context.Context, sub *entityStorageSub.CreateStorageSubscription, user_id int64, service_id int64, needPortTwo bool) (int64, int, int, error)

	GetStorageSubsByUser(ctx context.Context, userID int64) ([]*entityStorageSub.StorageSubscription, error)

	GetStorageSubsById(ctx context.Context, id int64, userId int64) (*entityStorageSub.StorageSubscription, error)
}

type ApiStorageSub struct {
	bz BusinessStorageSub
}

func NewApiStorageSub(bz BusinessStorageSub) *ApiStorageSub {
	return &ApiStorageSub{
		bz: bz,
	}
}
