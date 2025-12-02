package runtimesub

import (
	"context"
	"fmt"
	c_uid "lite-paas/common/uid"
	c_utils "lite-paas/common/utils"
	k8smanager "lite-paas/k8s-service/k8s-manager/runtime"
	docker "lite-paas/k8s-service/templates/docker"
	entityRuntimeSub "lite-paas/services/entity/runtime_sub"
	"strings"
)

func (b *RuntimeSubBusiness) UpdateRuntimeSub(ctx context.Context, id int, idUser int, data *entityRuntimeSub.UpdateRuntimeSubscription, namepace string, baseDomain string) error {
	err := data.Validate()
	if err != nil {
		return err
	}
	errUp := b.bz.UpdateRuntimesub(ctx, id, data)
	if errUp != nil {
		return errUp
	}
	serviceRuntime, _ := b.bz.GetRuntimeSubByID(ctx, int64(id))
	serviceDb, _ := b.bzRuntime.GetRuntimeById(ctx, int(serviceRuntime.ServiceId))
	nameImage := strings.ToLower(serviceDb.Name)
	user, _ := b.bzUser.BzGetUsersById(ctx, idUser)
	uid_i := c_uid.NewUID(uint32(id), 6).ToBase58()
	appName := fmt.Sprintf("%s-%s", strings.ReplaceAll(strings.ToLower(user.Name), " ", ""), uid_i)
	file, _ := docker.ChooseRuntime(nameImage)

	//ids := c_uid.NewUID(uint32(idService), 6)
	k8smanager.Deploy(b.hub, c_utils.SanitizeK8sName(appName), uid_i, *data.Token, *data.LinkGit, namepace, baseDomain, file)
	return nil
}
