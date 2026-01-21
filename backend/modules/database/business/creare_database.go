package database

import (
	"context"
	entityDatabase "lite-paas/modules/database/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (b *BussinessDatabase) BzCreateDatabase(ctx context.Context, data *entityDatabase.CreateDatabaseService) *c_errors.AppError {
	err := data.Validate()
	if err != nil {
		err := c_errors.NewAppError(400, http.StatusText(400), err)
		return err
	}
	errCreate := b.bz.CreateDatabase(ctx, data)

	if errCreate != nil {
		errCreate := c_errors.NewAppError(500, http.StatusText(500), errCreate)
		return errCreate
	}
	return nil
}
