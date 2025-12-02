package runtime

import (
	"context"
	entityRuntime "lite-paas/services/entity/runtime"
)

type BusinessRuntime interface {
	CreateRuntime(ctx context.Context, data *entityRuntime.CreateRuntime) error
	GetAllRuntime(ctx context.Context) ([]*entityRuntime.RuntimeService, error)
	UpdateRuntime(ctx context.Context, id int, data *entityRuntime.UpdateRuntime) error
}

type ApiRuntime struct {
	bz BusinessRuntime
}

func NewApiRuntime(bz BusinessRuntime) *ApiRuntime {
	return &ApiRuntime{
		bz: bz,
	}
}
