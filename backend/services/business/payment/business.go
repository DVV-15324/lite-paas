package payment

import (
	entityInvoice "lite-paas/services/entity/invoice"
	entityPayment "lite-paas/services/entity/payment"
	entityRuntimeSub "lite-paas/services/entity/runtime_sub"
	//entityStorageSub "lite-paas/services/entity/storage_sub"
	"context"
)

type ReponsitoryPayment interface {
	CreatePayment(ctx context.Context, p *entityPayment.CreatePayment, invoiceId int64) (int64, error)
	ListPaymentsByInvoice(ctx context.Context, invoiceID int64) ([]*entityPayment.Payment, error)
	GetPaymentByID(ctx context.Context, id int64) (*entityPayment.Payment, error)
}

type BzInvoice interface {
	UpdateInvoiceStatus(ctx context.Context, id int64, status string) error
	ListInvoicesByUser(ctx context.Context, userID int64) ([]*entityInvoice.Invoice, error)
	CreateInvoice(ctx context.Context, inv *entityInvoice.CreateInvoice, user_id int64) (int64, error)
	GetInvoiceByID(ctx context.Context, id int64) (*entityInvoice.Invoice, error)
}

type BzRuntimeSub interface {
	CreateNewRuntimeSub(ctx context.Context, sub *entityRuntimeSub.CreateRuntimeSubscription, user_id int64, service_id int64) (int64, error)
	GetRuntimeSubsByUser(ctx context.Context, userID int64) ([]*entityRuntimeSub.RuntimeSubscription, error)
}

type BussinessPayment struct {
	bz        ReponsitoryPayment
	bzInvoice BzInvoice
	//bzStorageSub BzStorageSub
	bzRuntimeSub BzRuntimeSub
}

func NewBussinessPayment(bz ReponsitoryPayment, bzInvoice BzInvoice, bzRuntimeSub BzRuntimeSub) *BussinessPayment {
	return &BussinessPayment{
		bz:        bz,
		bzInvoice: bzInvoice,
		//bzStorageSub: bzStorageSub,
		bzRuntimeSub: bzRuntimeSub,
	}
}
