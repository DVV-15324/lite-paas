package runtimesub

import (
	"context"
	entityRuntimeSub "lite-paas/services/entity/runtime_sub"
)

func (b *RuntimeSubBusiness) GetRuntimeSubsByUser(ctx context.Context, userID int64) ([]*entityRuntimeSub.RuntimeSubscription, error) {
	runtimeList, _ := b.bz.ListRuntimeSubsByUser(ctx, userID)
	for i := 0; i < len(runtimeList); i++ {
		userInfo, _ := b.bzUser.BzGetUsersById(ctx, int(runtimeList[i].UserId))
		runtimeList[i].InfoUser = userInfo

		runtimeInfo, _ := b.bzRuntime.GetRuntimeById(ctx, int(runtimeList[i].ServiceId))
		runtimeList[i].InfoRunTime = runtimeInfo
	}
	return runtimeList, nil
}
