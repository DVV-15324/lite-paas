package runtimesub

import (
	"context"
	entityRuntimeSub "lite-paas/modules/runtime_sub/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (b *RuntimeSubBusiness) BzCreateNewRuntimeSub(
	ctx context.Context,
	sub *entityRuntimeSub.CreateRuntimeSubscription,
	userID int64,
	serviceID int64,
) (int64, *c_errors.AppError) {

	err := sub.Validate()
	if err != nil {
		app := c_errors.NewAppError(400, http.StatusText(400), err)
		return 0, app
	}
	user, _ := b.bzUser.BzGetUsersById(ctx, int(userID))
	id, err := b.bz.CreateRuntimeSub(ctx, sub, user.Name, userID, serviceID)
	if err != nil {
		app := c_errors.NewAppError(500, http.StatusText(500), err)
		return 0, app
	}

	return id, nil
}
