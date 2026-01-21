package database

import (
	"context"
	entityDatabase "lite-paas/modules/database/entity"
	c_errors "lite-paas/shared/errors"
)

type BusinessDatabase interface {
	BzCreateDatabase(ctx context.Context, data *entityDatabase.CreateDatabaseService) *c_errors.AppError
	BzGetAllDatabase(ctx context.Context) ([]*entityDatabase.DatabaseService, *c_errors.AppError)
}

type ApiDatabase struct {
	bz BusinessDatabase
}

func NewApiDatabase(bz BusinessDatabase) *ApiDatabase {
	return &ApiDatabase{
		bz: bz,
	}
}
