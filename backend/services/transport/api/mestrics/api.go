package mestrics

import (
	c_errors "lite-paas/common/errors"
	k8sMetrics "lite-paas/k8s-service/k8s-manager/mestrics"

	"context"
	entityUser "lite-paas/services/entity/user"
)

type ApiMestrics struct {
	mestrics *k8sMetrics.K8sManagerMetrics
	bzUser   BusinessUser
}
type BusinessUser interface {
	BzGetUsersById(ctx context.Context, id int) (*entityUser.Users, *c_errors.AppError)
}

func NewApiMestrics(mestrics *k8sMetrics.K8sManagerMetrics, bzUser BusinessUser) *ApiMestrics {
	return &ApiMestrics{
		mestrics: mestrics,
		bzUser:   bzUser,
	}
}
