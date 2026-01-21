package invoice

import (
	"github.com/gin-gonic/gin"
	c_errors "lite-paas/shared/errors"
	c_uid "lite-paas/shared/uid"
)

func (api *ApiInvoice) ApiGetInvoiceByID() func(c *gin.Context) {
	return func(c *gin.Context) {
		id := c.Param("id")

		uid := c_uid.DecodeFromBase58(id)
		invoice, err := api.bz.BzGetInvoiceByID(c.Request.Context(), int64(uid.LocalID))
		if err != nil {
			c_errors.NewErrorH(c, err)
			return
		}

		invoice.Mask()

		c_errors.NewSuccessH(c, invoice)
	}
}
