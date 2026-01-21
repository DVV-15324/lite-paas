package runtimesub

import (
	"context"

	entityRuntimeSub "lite-paas/modules/runtime_sub/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
	//"net/http"
)

func (b *RuntimeSubBusiness) BzGetRuntimeSubsByLinkGit(ctx context.Context, linkGit string) (*entityRuntimeSub.RuntimeSubscription, *c_errors.AppError) {

	runtimeSub, err := b.bz.GetRuntimeSubByLinkGit(ctx, linkGit)
	if err != nil {
		app := c_errors.NewAppError(404, http.StatusText(404), err)
		return nil, app
	}
	//fmt.Println(runtime.UserId)
	userInfo, err_u := b.bzUser.BzGetUsersById(ctx, int(runtimeSub.UserId))
	if err_u != nil {
		//app := c_errors.NewAppError(404, http.StatusText(404), err)
		return nil, err_u
	}
	runtimeSub.InfoUser = userInfo
	runtimeInfo, _ := b.bzRuntime.BzGetRuntimeById(ctx, int(runtimeSub.ServiceId))
	runtimeSub.InfoRunTime = runtimeInfo

	return runtimeSub, nil
}
