package runtime

import (
	"context"
	entityRuntime "lite-paas/services/entity/runtime"
)

func (b *BussinessRuntime) GetAllRuntime(ctx context.Context) ([]*entityRuntime.RuntimeService, error) {
	runtimes, err := b.bz.GetAllRuntime(ctx)
	if err != nil {
		return nil, err
	}

	if len(runtimes) == 0 {
		return []*entityRuntime.RuntimeService{}, nil
	}

	return runtimes, nil
}
