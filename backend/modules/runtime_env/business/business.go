package runtime_env

import (
	"context"
	entityRuntimeEnv "lite-paas/modules/runtime_env/entity"
)

type ReponsitoryRuntimeEnv interface {
	CreateRuntimeEnv(ctx context.Context, rte *entityRuntimeEnv.CreateRuntimeEnv, runtime_id int) (int64, error)
	GetRtEnv(ctx context.Context, id int) (*entityRuntimeEnv.RuntimeEnv, error)
}

type BusinessRuntimeEnv struct {
	bz ReponsitoryRuntimeEnv
}

func NewBusinessRuntimeEnv(bz ReponsitoryRuntimeEnv) *BusinessRuntimeEnv {
	return &BusinessRuntimeEnv{bz: bz}
}
