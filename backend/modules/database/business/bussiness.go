package database

import (
	"context"
	entityDatabase "lite-paas/modules/database/entity"
)

type ReponsitoryDatabase interface {
	CreateDatabase(ctx context.Context, storage *entityDatabase.CreateDatabaseService) error
	GetAllDatabase(ctx context.Context) ([]*entityDatabase.DatabaseService, error)
	GetDatabaseById(ctx context.Context, id int) (*entityDatabase.DatabaseService, error)
}

type BussinessDatabase struct {
	bz ReponsitoryDatabase
}

func NewBussinessDatabase(repo ReponsitoryDatabase) *BussinessDatabase {
	return &BussinessDatabase{
		bz: repo,
	}
}
