package storage

import (
	"context"
	entityStorage "lite-paas/services/entity/storage"
)

func (b *BussinessStorage) UpdateStorage(ctx context.Context, id int, data *entityStorage.UpdateStorageService) error {
	// err := data.Validate()
	// if err != nil {
	// 	return err
	// }
	errUp := b.bz.UpdateStorage(ctx, id, data)
	if errUp != nil {
		return errUp
	}
	return nil
}
