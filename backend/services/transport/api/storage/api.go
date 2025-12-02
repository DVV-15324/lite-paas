package storage

import (
	"context"
	entityStorage "lite-paas/services/entity/storage"
)

type BusinessStorage interface {
	CreateStorage(ctx context.Context, data *entityStorage.CreateStorageService) error
	GetAllStorage(ctx context.Context) ([]*entityStorage.StorageService, error)
	UpdateStorage(ctx context.Context, id int, data *entityStorage.UpdateStorageService) error
}

type ApiStorage struct {
	bz BusinessStorage
}

func NewApiStorage(bz BusinessStorage) *ApiStorage {
	return &ApiStorage{
		bz: bz,
	}
}
