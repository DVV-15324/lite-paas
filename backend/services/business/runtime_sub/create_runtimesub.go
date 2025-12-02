package runtimesub

import (
	"context"
	entityRuntimeSub "lite-paas/services/entity/runtime_sub"
)

func (b *RuntimeSubBusiness) CreateNewRuntimeSub(
	ctx context.Context,
	sub *entityRuntimeSub.CreateRuntimeSubscription,
	userID int64,
	serviceID int64,
) (int64, error) {

	if err := sub.Validate(); err != nil {
		return 0, err
	}
	user, _ := b.bzUser.BzGetUsersById(ctx, int(userID))
	id, err := b.bz.CreateRuntimeSub(ctx, sub, user.Name, userID, serviceID)
	if err != nil {
		return 0, err
	}

	return id, nil
}
