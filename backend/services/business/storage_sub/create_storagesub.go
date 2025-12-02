package storagesub

import (
	"context"
	entityStorageSub "lite-paas/services/entity/storage_sub"
)

func (b *BussinessStorageSub) CreateNewStorageSub(ctx context.Context, sub *entityStorageSub.CreateStorageSubscription, user_id int64, service_id int64, needPortTwo bool) (int64, int, int, error) {
	// Gọi hàm Validate trong entity (nếu có)
	if err := sub.Validate(); err != nil {
		return 0, 0, 0, err
	}
	return b.bz.CreateStorageSub(ctx, sub, user_id, service_id, needPortTwo)
}
