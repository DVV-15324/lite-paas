package runtime

import (
	"context"
	entityRuntime "lite-paas/services/entity/runtime"
)

func (b *BussinessRuntime) CreateRuntime(ctx context.Context, data *entityRuntime.CreateRuntime) error {
	err := data.Validate()
	if err != nil {
		return err
	}
	errCreate := b.bz.CreateRuntime(ctx, data)

	if errCreate != nil {
		return errCreate
	}
	return nil
}
