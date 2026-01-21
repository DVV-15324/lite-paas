package runtimesub

import (
	"context"

	entityRuntimeSub "lite-paas/modules/runtime_sub/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
	//"net/http"
)

func (b *RuntimeSubBusiness) BzGetRuntimeSubsById(ctx context.Context, id int64) (*entityRuntimeSub.RuntimeSubscription, *c_errors.AppError) {

	runtime, err := b.bz.GetRuntimeSubByID(ctx, id)
	if err != nil {
		app := c_errors.NewAppError(404, http.StatusText(404), err)
		return nil, app
	}
	//fmt.Println(runtime.UserId)
	userInfo, err_u := b.bzUser.BzGetUsersById(ctx, int(runtime.UserId))
	if err_u != nil {
		//app := c_errors.NewAppError(404, http.StatusText(404), err)
		return nil, err_u
	}
	runtime.InfoUser = userInfo
	runtimeInfo, _ := b.bzRuntime.BzGetRuntimeById(ctx, int(runtime.ServiceId))
	runtime.InfoRunTime = runtimeInfo

	return runtime, nil
}
