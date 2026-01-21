package runtime

import (
	"context"
	entityRuntime "lite-paas/modules/runtimes/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (b *BussinessRuntime) BzCreateRuntime(ctx context.Context, data *entityRuntime.CreateRuntime) *c_errors.AppError {
	err := data.Validate()
	if err != nil {
		app := c_errors.NewAppError(400, http.StatusText(400), err)
		return app
	}
	errCreate := b.bz.CreateRuntime(ctx, data)

	if errCreate != nil {
		app := c_errors.NewAppError(500, http.StatusText(500), errCreate)
		return app
	}
	return nil
}
