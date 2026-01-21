package database_env

import (
	"context"
	entityDatabaseEnv "lite-paas/modules/database_env/entity"
)

type ReponsitoryDatabaseEnv interface {
	CreateDatabaseEnv(ctx context.Context, dbe *entityDatabaseEnv.CreateDatabaseEnv, database_id int) (int64, error)
	GetDbEnv(ctx context.Context, database_id int) (*entityDatabaseEnv.DatabaseEnv, error)
}

type BusinessDatabaseEnv struct {
	bz ReponsitoryDatabaseEnv
}

func NewBusinessDatabaseEnv(bz ReponsitoryDatabaseEnv) *BusinessDatabaseEnv {
	return &BusinessDatabaseEnv{
		bz: bz,
	}
}
