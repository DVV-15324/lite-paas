package invoice

import (
	"context"
	entityDatabase "lite-paas/modules/database/entity"
	entityInvoice "lite-paas/modules/invoices/entity"
	entityRuntime "lite-paas/modules/runtimes/entity"
	entityUser "lite-paas/modules/users/entity"
	c_errors "lite-paas/shared/errors"
)

type ReponsitoryInvoice interface {
	CreateInvoice(ctx context.Context, inv *entityInvoice.CreateInvoice, user_id int64) (int64, error)
	ListInvoicesByUser(ctx context.Context, userID int64) ([]*entityInvoice.Invoice, error)
	GetInvoiceByID(ctx context.Context, id int64) (*entityInvoice.Invoice, error)
	UpdateInvoiceStatus(ctx context.Context, id int64) error
	ListInvoicesAll(ctx context.Context) ([]*entityInvoice.Invoice, error)
}
type BusinessRuntime interface {
	BzGetRuntimeById(ctx context.Context, id int) (*entityRuntime.RuntimeService, *c_errors.AppError)
}

type BusinessDatabase interface {
	BzGetDatabaseById(ctx context.Context, id int) (*entityDatabase.DatabaseService, *c_errors.AppError)
}
type BussinessInvoice struct {
	bz         ReponsitoryInvoice
	bzRuntime  BusinessRuntime
	bzDatabase BusinessDatabase
	bzUser     BzUser
}
type BzUser interface {
	BzCreateUser(ctx context.Context, cu *entityUser.CreateUserForm) (int, *c_errors.AppError)
	BzGetUsersById(ctx context.Context, id int) (*entityUser.Users, *c_errors.AppError)
}

func NewBussinessInvoice(bz ReponsitoryInvoice, bzRuntime BusinessRuntime, bzDatabase BusinessDatabase, bzUser BzUser) *BussinessInvoice {
	return &BussinessInvoice{
		bz:         bz,
		bzRuntime:  bzRuntime,
		bzDatabase: bzDatabase,
		bzUser:     bzUser,
	}
}
