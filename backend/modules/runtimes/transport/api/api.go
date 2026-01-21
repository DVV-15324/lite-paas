package runtime

import (
	"context"
	entityRuntime "lite-paas/modules/runtimes/entity"
	c_errors "lite-paas/shared/errors"
)

type BusinessRuntime interface {
	BzCreateRuntime(ctx context.Context, data *entityRuntime.CreateRuntime) *c_errors.AppError
	BzGetAllRuntime(ctx context.Context) ([]*entityRuntime.RuntimeService, *c_errors.AppError)
}
type ApiRuntime struct {
	bz BusinessRuntime
}

func NewApiRuntime(bz BusinessRuntime) *ApiRuntime {
	return &ApiRuntime{
		bz: bz,
	}
}
