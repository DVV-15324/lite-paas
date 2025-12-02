package storagesub

import (
	"context"
	entityStorageSub "lite-paas/services/entity/storage_sub"
)

func (b *BussinessStorageSub) GetStorageSubsById(ctx context.Context, id int64, userId int64) (*entityStorageSub.StorageSubscription, error) {
	storage, _ := b.bz.GetStorageSubsById(ctx, id)
	userInfo, _ := b.bzUser.BzGetUsersById(ctx, int(storage.UserId))
	storage.InfoUser = userInfo
	storageInfo, _ := b.bzStorage.GetStorageById(ctx, int(storage.ServiceId))
	storage.InfoStorage = storageInfo

	return storage, nil
}
