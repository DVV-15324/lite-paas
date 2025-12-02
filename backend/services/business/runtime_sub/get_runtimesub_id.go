package runtimesub

import (
	"context"
	entityRuntimeSub "lite-paas/services/entity/runtime_sub"
)

func (b *RuntimeSubBusiness) GetRuntimeSubsById(ctx context.Context, id int64) (*entityRuntimeSub.RuntimeSubscription, error) {
	runtime, _ := b.bz.GetRuntimeSubByID(ctx, id)
	userInfo, _ := b.bzUser.BzGetUsersById(ctx, int(runtime.UserId))
	runtime.InfoUser = userInfo
	runtimeInfo, _ := b.bzRuntime.GetRuntimeById(ctx, int(runtime.ServiceId))
	runtime.InfoRunTime = runtimeInfo

	return runtime, nil
}
