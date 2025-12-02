package invoice

import (
	c_ctx "lite-paas/common/ctx"
	"net/http"

	c_uid "lite-paas/common/uid"

	"github.com/gin-gonic/gin"
)

func (api *ApiInvoice) ApiListInvoicesByUser() func(c *gin.Context) {
	return func(c *gin.Context) {
		id := c_ctx.GetRequestContext(c.Request.Context()).GetSub()
		uid := c_uid.DecodeFromBase58(id)

		invoices, err := api.bz.ListInvoicesByUser(c.Request.Context(), int64(uid.LocalID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		for i := 0; i < len(invoices); i++ {
			invoices[i].Mask()
		}
		c.JSON(http.StatusOK, invoices)
	}
}
