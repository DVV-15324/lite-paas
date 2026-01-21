package payment

import (
	//entityInvoice "lite-paas/modules/invoices/entity"
	entityPayment "lite-paas/modules/payments/entity"
	//entityRuntimeSub "lite-paas/modules/runtime_sub/entity"
	//c_errors "lite-paas/shared/errors"

	//entityStorageSub "lite-paas/modules/entity/storage_sub"
	"context"
)

type ReponsitoryPayment interface {
	CreatePayment(ctx context.Context, p *entityPayment.CreatePayment, invoiceId int64) (int64, error)
}

// type BzInvoice interface {
// 	UpdateInvoiceStatus(ctx context.Context, id int64, status string) *c_errors.AppError
// 	ListInvoicesByUser(ctx context.Context, userID int64) ([]*entityInvoice.Invoice, *c_errors.AppError)
// 	CreateInvoice(ctx context.Context, inv *entityInvoice.CreateInvoice, user_id int64) (int64, *c_errors.AppError)
// 	GetInvoiceByID(ctx context.Context, id int64) (*entityInvoice.Invoice, *c_errors.AppError)
// }

// type BzRuntimeSub interface {
// 	CreateNewRuntimeSub(ctx context.Context, sub *entityRuntimeSub.CreateRuntimeSubscription, user_id int64, service_id int64) (int64, *c_errors.AppError)
// 	GetRuntimeSubsByUser(ctx context.Context, userID int64) ([]*entityRuntimeSub.RuntimeSubscription, *c_errors.AppError)
//}

type BussinessPayment struct {
	bz ReponsitoryPayment
	// bzInvoice BzInvoice
	// //bzStorageSub BzStorageSub
	// bzRuntimeSub BzRuntimeSub
}

func NewBussinessPayment(bz ReponsitoryPayment, //bzInvoice BzInvoice, bzRuntimeSub BzRuntimeSub
) *BussinessPayment {
	return &BussinessPayment{
		bz: bz,
		//bzInvoice: bzInvoice,
		//bzStorageSub: bzStorageSub,
		//bzRuntimeSub: bzRuntimeSub,
	}
}
