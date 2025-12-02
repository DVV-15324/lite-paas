package storage

import (
	"context"
	entitystorage "lite-paas/services/entity/storage"
)

func (b *BussinessStorage) CreateStorage(ctx context.Context, data *entitystorage.CreateStorageService) error {
	err := data.Validate()
	if err != nil {
		return err
	}
	errCreate := b.bz.CreateStorage(ctx, data)

	if errCreate != nil {
		return errCreate
	}
	return nil
}
