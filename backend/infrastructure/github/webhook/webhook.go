package webhook

import (
	"context"
	entityRuntimeSub "lite-paas/modules/runtime_sub/entity"
	c_errors "lite-paas/shared/errors"
)

type BusinessRuntimeSub interface {
	BzGetRuntimeSubsByLinkGit(ctx context.Context, linkGit string) (*entityRuntimeSub.RuntimeSubscription, *c_errors.AppError)
	BzUpdateRuntimeSub(ctx context.Context, id int, idUser int, data *entityRuntimeSub.UpdateRuntimeSubscription, namepace string, baseDomain string) *c_errors.AppError
}

type WebhookHandler struct {
	bzRuntimeSub BusinessRuntimeSub
}

func NewWebhookHandler(bzRuntimeSub BusinessRuntimeSub) *WebhookHandler {
	return &WebhookHandler{
		bzRuntimeSub: bzRuntimeSub,
	}
}
