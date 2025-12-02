package storage

import (
	"context"
	entityStorage "lite-paas/services/entity/storage"
)

type StorageReponsitory interface {
	CreateStorage(ctx context.Context, storage *entityStorage.CreateStorageService) error
	GetAllStorage(ctx context.Context) ([]*entityStorage.StorageService, error)
	UpdateStorage(ctx context.Context, id int, storage *entityStorage.UpdateStorageService) error
	GetStorageById(ctx context.Context, id int) (*entityStorage.StorageService, error)
}

type BussinessStorage struct {
	bz StorageReponsitory
}

func NewBussinessStorage(repo StorageReponsitory) *BussinessStorage {
	return &BussinessStorage{
		bz: repo,
	}
}
