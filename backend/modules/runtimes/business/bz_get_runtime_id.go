package runtime

import (
	"context"
	entityRuntime "lite-paas/modules/runtimes/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (b *BussinessRuntime) BzGetRuntimeById(ctx context.Context, id int) (*entityRuntime.RuntimeService, *c_errors.AppError) {
	runtimes, err := b.bz.GetRuntimeById(ctx, id)
	if err != nil {
		app := c_errors.NewAppError(404, http.StatusText(404), err)
		return nil, app
	}

	return runtimes, nil
}
