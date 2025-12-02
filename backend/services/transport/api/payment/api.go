package payment

import (
	"context"
	c_errors "lite-paas/common/errors"
	hub "lite-paas/common/hub"
	entityInvoice "lite-paas/services/entity/invoice"
	entityPayment "lite-paas/services/entity/payment"
	entityRuntimeSub "lite-paas/services/entity/runtime_sub"
	entityStorage "lite-paas/services/entity/storage"
	entityStorageSub "lite-paas/services/entity/storage_sub"
	entityUser "lite-paas/services/entity/user"
)

type BusinessPayment interface {
	CreateNewPayment(ctx context.Context, p *entityPayment.CreatePayment, invoiceId int64) (int64, error)
	GetPaymentDetail(ctx context.Context, id int64) (*entityPayment.Payment, error)
	GetPaymentsByInvoice(ctx context.Context, invoiceID int64) ([]*entityPayment.Payment, error)
}
type BusinessRuntimeSub interface {
	CreateNewRuntimeSub(ctx context.Context, sub *entityRuntimeSub.CreateRuntimeSubscription, userID int64, serviceId int64) (int64, error)
}
type BusinessStorageSub interface {
	CreateNewStorageSub(ctx context.Context, sub *entityStorageSub.CreateStorageSubscription, user_id int64, service_id int64, needPortTwo bool) (int64, int, int, error)
}
type BusinessStorage interface {
	GetStorageById(ctx context.Context, id int) (*entityStorage.StorageService, error)
}
type BussinessInvoice interface {
	GetInvoiceByID(ctx context.Context, id int64) (*entityInvoice.Invoice, error)
	UpdateInvoiceStatus(ctx context.Context, id int64, status string) error
}
type BussinessUser interface {
	BzGetUsersById(ctx context.Context, id int) (*entityUser.Users, *c_errors.AppError)
}
type ApiPayment struct {
	bz           BusinessPayment
	bzRsub       BusinessRuntimeSub
	bzStoragesub BusinessStorageSub
	bzStorage    BusinessStorage
	bzInvoice    BussinessInvoice
	bzUser       BussinessUser
	hub          *hub.ServiceHub
}

func NewApiPayment(bz BusinessPayment, bzRsub BusinessRuntimeSub, bzInvoice BussinessInvoice, hub *hub.ServiceHub, bzUser BussinessUser, bzStoragesub BusinessStorageSub, bzStorage BusinessStorage) *ApiPayment {
	return &ApiPayment{
		bz:           bz,
		bzRsub:       bzRsub,
		bzInvoice:    bzInvoice,
		bzUser:       bzUser,
		hub:          hub,
		bzStoragesub: bzStoragesub,
		bzStorage:    bzStorage,
	}
}
