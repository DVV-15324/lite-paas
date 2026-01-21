package invoice

import (
	c_uid "lite-paas/shared/uid"

	"github.com/gin-gonic/gin"
	entityInvoice "lite-paas/modules/invoices/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (api *ApiInvoice) ApiUpdateInvoiceStatus() func(c *gin.Context) {
	return func(c *gin.Context) {
		id := c.Param("id")

		uid := c_uid.DecodeFromBase58(id)
		invoice, err := api.bz.BzGetInvoiceByID(c.Request.Context(), int64(uid.LocalID))

		var req entityInvoice.UpdateInvoice
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err = api.bz.BzUpdateInvoiceStatus(c.Request.Context(), invoice.Id)
		if err != nil {
			c_errors.NewErrorH(c, err)
			return
		}
		c_errors.NewSuccessH(c, "Invoice status updated successfully")
	}
}
