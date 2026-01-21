package invoice

import (
	c_ctx "lite-paas/shared/context"
	c_errors "lite-paas/shared/errors"
	c_uid "lite-paas/shared/uid"

	"github.com/gin-gonic/gin"
)

func (api *ApiInvoice) ApiListInvoicesByUser() func(c *gin.Context) {
	return func(c *gin.Context) {
		id := c_ctx.GetRequestContext(c.Request.Context()).GetSub()
		uid := c_uid.DecodeFromBase58(id)

		invoices, err := api.bz.BzListInvoicesByUser(c.Request.Context(), int64(uid.LocalID))
		if err != nil {
			c_errors.NewErrorH(c, err)
			return
		}
		for i := 0; i < len(invoices); i++ {
			invoices[i].Mask()
		}

		c_errors.NewSuccessH(c, invoices)
	}
}
