package invoice

import (
	c_uid "lite-paas/common/uid"

	"github.com/gin-gonic/gin"
	entityInvoice "lite-paas/services/entity/invoice"
	"net/http"
)

func (api *ApiInvoice) ApiUpdateInvoiceStatus() func(c *gin.Context) {
	return func(c *gin.Context) {
		id := c.Param("id")

		uid := c_uid.DecodeFromBase58(id)
		invoice, err := api.bz.GetInvoiceByID(c.Request.Context(), int64(uid.LocalID))

		var req entityInvoice.UpdateInvoice
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err = api.bz.UpdateInvoiceStatus(c.Request.Context(), invoice.Id, "paid")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Invoice status updated successfully"})
	}
}
