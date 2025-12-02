package storage

import (
	"context"
	entityStorage "lite-paas/services/entity/storage"
)

func (b *BussinessStorage) GetStorageById(ctx context.Context, id int) (*entityStorage.StorageService, error) {
	runtimes, err := b.bz.GetStorageById(ctx, id)
	if err != nil {
		return nil, err
	}

	return runtimes, nil
}
