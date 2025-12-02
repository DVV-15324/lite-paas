package storage

import (
	"context"
	entityStorage "lite-paas/services/entity/storage"
)

func (b *BussinessStorage) GetAllStorage(ctx context.Context) ([]*entityStorage.StorageService, error) {
	storages, err := b.bz.GetAllStorage(ctx)
	if err != nil {
		return nil, err
	}

	if len(storages) == 0 {
		return []*entityStorage.StorageService{}, nil
	}

	return storages, nil
}
