package runtimesub

import (
	"context"
	"fmt"
	k8smanager "lite-paas/infrastructure/k8s/k8s-manager/runtime"

	entityRuntimeSub "lite-paas/modules/runtime_sub/entity"
	c_errors "lite-paas/shared/errors"
	c_uid "lite-paas/shared/uid"
	c_utils "lite-paas/shared/utils"
	"net/http"
	"strings"
)

func (b *RuntimeSubBusiness) BzUpdateRuntimeSub(ctx context.Context, id int, idUser int, data *entityRuntimeSub.UpdateRuntimeSubscription, namepace string, baseDomain string) *c_errors.AppError {
	err := data.Validate()
	if err != nil {
		app := c_errors.NewAppError(400, http.StatusText(400), err)
		return app
	}
	errUp := b.bz.UpdateRuntimesub(ctx, id, data)
	if err != nil {
		app := c_errors.NewAppError(500, http.StatusText(500), errUp)
		return app
	}
	serviceRuntimeSub, _ := b.bz.GetRuntimeSubByID(ctx, int64(id))
	serviceRuntime, _ := b.bzRuntime.BzGetRuntimeById(ctx, int(serviceRuntimeSub.ServiceId))
	serviceRuntimeEnv, _ := b.bzRuntimeEnv.BzGetRuntimeEnvById(ctx, int(serviceRuntime.Id))
	user, _ := b.bzUser.BzGetUsersById(ctx, idUser)
	uid_i := c_uid.NewUID(uint32(id), 6).ToBase58()
	appName := fmt.Sprintf("%s-%s", strings.ReplaceAll(strings.ToLower(user.Name), " ", ""), uid_i)
	//fmt.Println(serviceRuntimeEnv.DockerFile)
	//ids := c_uid.NewUID(uint32(idService), 6)
	if data.LinkGit == nil && data.TokenGit == nil {
		data.LinkGit = serviceRuntimeSub.LinkGit
		data.TokenGit = serviceRuntimeSub.TokenGit
	}
	k8smanager.Deploy(c_utils.SanitizeK8sName(appName), uid_i, *data.TokenGit, *data.LinkGit, namepace, baseDomain, serviceRuntimeEnv.DockerFile, serviceRuntime.RAM, serviceRuntime.CPU, serviceRuntime.Storage)
	return nil
}
