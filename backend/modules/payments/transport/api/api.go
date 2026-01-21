package payment

import (
	"context"
	entityDatabase "lite-paas/modules/database/entity"
	entityDatabaseEnv "lite-paas/modules/database_env/entity"
	entityDatabaseSub "lite-paas/modules/database_sub/entity"
	entityInvoice "lite-paas/modules/invoices/entity"
	entityPayment "lite-paas/modules/payments/entity"
	entityRuntimeSub "lite-paas/modules/runtime_sub/entity"
	entityUser "lite-paas/modules/users/entity"
	c_errors "lite-paas/shared/errors"
)

type BusinessPayment interface {
	BzCreateNewPayment(ctx context.Context, p *entityPayment.CreatePayment, invoiceId int64) (int64, *c_errors.AppError)
}
type BusinessRuntimeSub interface {
	BzCreateNewRuntimeSub(ctx context.Context, sub *entityRuntimeSub.CreateRuntimeSubscription, userID int64, serviceId int64) (int64, *c_errors.AppError)
}
type BusinessDatabaseSub interface {
	BzCreateNewDatabaseSub(ctx context.Context, sub *entityDatabaseSub.CreateDatabaseSub, user_id int64, service_id int64) (int64, int, *c_errors.AppError)
}
type BusinessDatabase interface {
	BzGetDatabaseById(ctx context.Context, id int) (*entityDatabase.DatabaseService, *c_errors.AppError)
}
type BusinessDatabaseEnv interface {
	BzGetDatabaseEnvById(ctx context.Context, database_id int) (*entityDatabaseEnv.DatabaseEnv, *c_errors.AppError)
}
type BussinessInvoice interface {
	BzGetInvoiceByID(ctx context.Context, id int64) (*entityInvoice.Invoice, *c_errors.AppError)
	BzUpdateInvoiceStatus(ctx context.Context, id int64) *c_errors.AppError
}
type BussinessUser interface {
	BzGetUsersById(ctx context.Context, id int) (*entityUser.Users, *c_errors.AppError)
}
type ApiPayment struct {
	bz            BusinessPayment
	bzRsub        BusinessRuntimeSub
	bzDatabasesub BusinessDatabaseSub
	bzDatabase    BusinessDatabase
	bzDatabaseEnv BusinessDatabaseEnv
	bzInvoice     BussinessInvoice
	bzUser        BussinessUser
}

func NewApiPayment(bz BusinessPayment, bzRsub BusinessRuntimeSub, bzInvoice BussinessInvoice, bzUser BussinessUser, bzDatabasesub BusinessDatabaseSub, bzDatabase BusinessDatabase, bzDatabaseEnv BusinessDatabaseEnv) *ApiPayment {
	return &ApiPayment{
		bz:            bz,
		bzRsub:        bzRsub,
		bzInvoice:     bzInvoice,
		bzUser:        bzUser,
		bzDatabaseEnv: bzDatabaseEnv,
		bzDatabasesub: bzDatabasesub,
		bzDatabase:    bzDatabase,
	}
}
