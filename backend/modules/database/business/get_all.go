package database

import (
	"context"
	entityDatabase "lite-paas/modules/database/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (b *BussinessDatabase) BzGetAllDatabase(ctx context.Context) ([]*entityDatabase.DatabaseService, *c_errors.AppError) {
	databases, err := b.bz.GetAllDatabase(ctx)
	if err != nil {
		app := c_errors.NewAppError(500, http.StatusText(500), err)
		return nil, app
	}

	if len(databases) == 0 {
		return []*entityDatabase.DatabaseService{}, nil
	}

	return databases, nil
}
