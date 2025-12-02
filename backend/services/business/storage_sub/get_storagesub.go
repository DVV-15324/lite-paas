package storagesub

import (
	"context"
	entityStorageSub "lite-paas/services/entity/storage_sub"
)

func (b *BussinessStorageSub) GetStorageSubsByUser(ctx context.Context, userID int64) ([]*entityStorageSub.StorageSubscription, error) {
	storageList, _ := b.bz.ListStorageSubsByUser(ctx, userID)
	for i := 0; i < len(storageList); i++ {
		userInfo, _ := b.bzUser.BzGetUsersById(ctx, int(storageList[i].UserId))
		storageList[i].InfoUser = userInfo

		storageInfo, _ := b.bzStorage.GetStorageById(ctx, int(storageList[i].ServiceId))
		storageList[i].InfoStorage = storageInfo
	}
	return storageList, nil

}
