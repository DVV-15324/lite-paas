package runtime

import (
	"context"
	entityRuntime "lite-paas/modules/runtimes/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (b *BussinessRuntime) BzGetAllRuntime(ctx context.Context) ([]*entityRuntime.RuntimeService, *c_errors.AppError) {
	runtimes, err := b.bz.GetAllRuntime(ctx)
	if err != nil {
		app := c_errors.NewAppError(404, http.StatusText(404), err)
		return nil, app
	}

	if len(runtimes) == 0 {
		return []*entityRuntime.RuntimeService{}, nil
	}

	return runtimes, nil
}
