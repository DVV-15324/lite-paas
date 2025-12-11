package runtime

import (
	"context"
	entityRuntime "lite-paas/services/entity/runtime"
)

func (b *BussinessRuntime) UpdateRuntime(ctx context.Context, id int, data *entityRuntime.UpdateRuntime) error {
	// err := data.Validate()
	// if err != nil {
	// 	return err
	// }
	errUp := b.bz.UpdateRuntime(ctx, id, data)
	if errUp != nil {
		return errUp
	}
	return nil
}
