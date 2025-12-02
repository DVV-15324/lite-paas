package runtime

import (
	"context"
	entityRuntime "lite-paas/services/entity/runtime"
)

type RuntimeReponsitory interface {
	CreateRuntime(ctx context.Context, runtime *entityRuntime.CreateRuntime) error
	GetAllRuntime(ctx context.Context) ([]*entityRuntime.RuntimeService, error)
	UpdateRuntime(ctx context.Context, id int, runtime *entityRuntime.UpdateRuntime) error
	GetRuntimeById(ctx context.Context, id int) (*entityRuntime.RuntimeService, error)
}
type BussinessRuntime struct {
	bz RuntimeReponsitory
}

func NewBussinessRuntime(repo RuntimeReponsitory) *BussinessRuntime {
	return &BussinessRuntime{
		bz: repo,
	}
}
