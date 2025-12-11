package invoice

import (
	"github.com/gin-gonic/gin"

	"net/http"
)

func (api *ApiInvoice) ApiGetInvoiceAll() func(c *gin.Context) {
	return func(c *gin.Context) {

		invoice, err := api.bz.ListInvoicesAll(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if invoice == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Invoice not found"})
			return
		}
		for i := 0; i < len(invoice); i++ {
			invoice[i].Mask()
		}

		c.JSON(http.StatusOK, invoice)
	}
}
