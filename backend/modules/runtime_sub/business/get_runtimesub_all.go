package runtimesub

import (
	"context"
	entityRuntimeSub "lite-paas/modules/runtime_sub/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (b *RuntimeSubBusiness) BzGetRuntimeSubsAll(ctx context.Context) ([]*entityRuntimeSub.RuntimeSubscription, *c_errors.AppError) {
	runtimeList, err := b.bz.ListRuntimeSubsAll(ctx)
	if err != nil {
		app := c_errors.NewAppError(404, http.StatusText(404), err)
		return nil, app
	}
	for i := 0; i < len(runtimeList); i++ {
		userInfo, _ := b.bzUser.BzGetUsersById(ctx, int(runtimeList[i].UserId))
		runtimeList[i].InfoUser = userInfo

		runtimeInfo, _ := b.bzRuntime.BzGetRuntimeById(ctx, int(runtimeList[i].ServiceId))
		runtimeList[i].InfoRunTime = runtimeInfo
	}
	return runtimeList, nil
}
