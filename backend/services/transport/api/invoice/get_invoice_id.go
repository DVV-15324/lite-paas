package invoice

import (
	"github.com/gin-gonic/gin"
	c_uid "lite-paas/common/uid"
	"net/http"
)

func (api *ApiInvoice) ApiGetInvoiceByID() func(c *gin.Context) {
	return func(c *gin.Context) {
		id := c.Param("id")

		uid := c_uid.DecodeFromBase58(id)
		invoice, err := api.bz.GetInvoiceByID(c.Request.Context(), int64(uid.LocalID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if invoice == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Invoice not found"})
			return
		}

		invoice.Mask()

		c.JSON(http.StatusOK, invoice)
	}
}
