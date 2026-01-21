package invoice

import (
	"context"
	"fmt"
	entityInvoice "lite-paas/modules/invoices/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (b *BussinessInvoice) BzListInvoicesAll(ctx context.Context) ([]*entityInvoice.Invoice, *c_errors.AppError) {
	invoiceList, err := b.bz.ListInvoicesAll(ctx)
	if err != nil {
		app := c_errors.NewAppError(404, http.StatusText(404), err)
		return nil, app
	}
	for i := 0; i < len(invoiceList); i++ {
		userInfo, _ := b.bzUser.BzGetUsersById(ctx, int(invoiceList[i].UserId))
		invoiceList[i].InfoUser = userInfo
		switch invoiceList[i].ServiceType {
		case "runtime":
			runtimeInfo, _ := b.bzRuntime.BzGetRuntimeById(ctx, int(invoiceList[i].ServiceID))
			invoiceList[i].InfoRunTime = runtimeInfo

		case "database":

			dbInfo, _ := b.bzDatabase.BzGetDatabaseById(ctx, int(invoiceList[i].ServiceID))
			if dbInfo != nil {
				invoiceList[i].InfoDatabase = dbInfo
			} else {
				fmt.Println("Database info nil for ID:", invoiceList[i].ServiceID)
			}
		}

	}

	return invoiceList, nil
}
