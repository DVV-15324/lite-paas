package runtime

import (
	"context"
	entityRuntime "lite-paas/modules/runtimes/entity"
)

type ReponsitoryRuntime interface {
	CreateRuntime(ctx context.Context, runtime *entityRuntime.CreateRuntime) error
	GetAllRuntime(ctx context.Context) ([]*entityRuntime.RuntimeService, error)
	GetRuntimeById(ctx context.Context, id int) (*entityRuntime.RuntimeService, error)
}
type BussinessRuntime struct {
	bz ReponsitoryRuntime
}

func NewBussinessRuntime(repo ReponsitoryRuntime) *BussinessRuntime {
	return &BussinessRuntime{
		bz: repo,
	}
}
