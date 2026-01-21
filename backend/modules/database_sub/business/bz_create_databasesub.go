package database_sub

import (
	"context"
	entityDatabaseSub "lite-paas/modules/database_sub/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (b *BussinessDatabaseSub) BzCreateNewDatabaseSub(ctx context.Context, sub *entityDatabaseSub.CreateDatabaseSub, user_id int64, service_id int64) (int64, int, *c_errors.AppError) {
	// Gọi hàm Validate trong entity (nếu có)
	err := sub.Validate()
	if err != nil {
		app := c_errors.NewAppError(400, http.StatusText(400), err)
		return 0, 0, app
	}
	i, portone, err := b.bz.CreateDatabaseSub(ctx, sub, user_id, service_id)
	if err != nil {
		app := c_errors.NewAppError(500, http.StatusText(500), err)
		return 0, 0, app
	}
	return i, portone, nil
}
