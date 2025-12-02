package invoice

import (
	"context"
	c_errors "lite-paas/common/errors"
	entityInvoice "lite-paas/services/entity/invoice"
	entityRuntime "lite-paas/services/entity/runtime"
	entityStorage "lite-paas/services/entity/storage"
	entityUser "lite-paas/services/entity/user"
)

type ReponsitoryInvoice interface {
	CreateInvoice(ctx context.Context, inv *entityInvoice.CreateInvoice, user_id int64) (int64, error)
	ListInvoicesByUser(ctx context.Context, userID int64) ([]*entityInvoice.Invoice, error)
	GetInvoiceByID(ctx context.Context, id int64) (*entityInvoice.Invoice, error)
	UpdateInvoiceStatus(ctx context.Context, id int64, status string) error
}
type BusinessRuntime interface {
	GetRuntimeById(ctx context.Context, id int) (*entityRuntime.RuntimeService, error)
}

type BusinessStorage interface {
	GetStorageById(ctx context.Context, id int) (*entityStorage.StorageService, error)
}
type BussinessInvoice struct {
	bz        ReponsitoryInvoice
	bzRuntime BusinessRuntime
	bzStorage BusinessStorage
	bzUser    BzUser
}
type BzUser interface {
	BzCreateUser(ctx context.Context, cu *entityUser.CreateUserForm) (int, *c_errors.AppError)
	BzGetUsersById(ctx context.Context, id int) (*entityUser.Users, *c_errors.AppError)
}

func NewBussinessInvoice(bz ReponsitoryInvoice, bzRuntime BusinessRuntime, bzStorage BusinessStorage, bzUser BzUser) *BussinessInvoice {
	return &BussinessInvoice{
		bz:        bz,
		bzRuntime: bzRuntime,
		bzStorage: bzStorage,
		bzUser:    bzUser,
	}
}
