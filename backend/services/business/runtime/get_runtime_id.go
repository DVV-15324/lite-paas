package runtime

import (
	"context"
	entityRuntime "lite-paas/services/entity/runtime"
)

func (b *BussinessRuntime) GetRuntimeById(ctx context.Context, id int) (*entityRuntime.RuntimeService, error) {
	runtimes, err := b.bz.GetRuntimeById(ctx, id)
	if err != nil {
		return nil, err
	}

	return runtimes, nil
}
