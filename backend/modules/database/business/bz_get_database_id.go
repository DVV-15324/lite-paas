package database

import (
	"context"
	entityDatabase "lite-paas/modules/database/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (b *BussinessDatabase) BzGetDatabaseById(ctx context.Context, id int) (*entityDatabase.DatabaseService, *c_errors.AppError) {
	runtimes, err := b.bz.GetDatabaseById(ctx, id)
	if err != nil {
		app := c_errors.NewAppError(404, http.StatusText(404), err)
		return nil, app
	}

	return runtimes, nil
}
