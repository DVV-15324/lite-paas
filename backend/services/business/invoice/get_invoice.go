package invoice

import (
	"context"
	"fmt"
	entityInvoice "lite-paas/services/entity/invoice"
)

func (b *BussinessInvoice) ListInvoicesByUser(ctx context.Context, userID int64) ([]*entityInvoice.Invoice, error) {
	invoiceList, _ := b.bz.ListInvoicesByUser(ctx, userID)
	for i := 0; i < len(invoiceList); i++ {
		userInfo, _ := b.bzUser.BzGetUsersById(ctx, int(invoiceList[i].UserId))
		invoiceList[i].InfoUser = userInfo
		switch invoiceList[i].ServiceType {
		case "runtime":
			runtimeInfo, _ := b.bzRuntime.GetRuntimeById(ctx, int(invoiceList[i].ServiceID))
			invoiceList[i].InfoRunTime = runtimeInfo

		case "storage":
			storageInfo, _ := b.bzStorage.GetStorageById(ctx, int(invoiceList[i].ServiceID))
			invoiceList[i].InfoStorage = storageInfo
			if storageInfo != nil {
				invoiceList[i].InfoStorage = storageInfo
			} else {
				fmt.Println("Storage info nil for ID:", invoiceList[i].ServiceID)
			}
		case "database":
			// Giả sử bạn cũng dùng bzStorage nhưng database ID khác kiểu,
			// cần check trả về có nil không
			dbInfo, _ := b.bzStorage.GetStorageById(ctx, int(invoiceList[i].ServiceID))
			if dbInfo != nil {
				invoiceList[i].InfoStorage = dbInfo
			} else {
				fmt.Println("Database info nil for ID:", invoiceList[i].ServiceID)
			}
		}

	}

	return invoiceList, nil
}
