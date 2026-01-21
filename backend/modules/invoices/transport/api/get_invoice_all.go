package invoice

import (
	"github.com/gin-gonic/gin"
	c_errors "lite-paas/shared/errors"
)

func (api *ApiInvoice) ApiGetInvoiceAll() func(c *gin.Context) {
	return func(c *gin.Context) {

		invoice, err := api.bz.BzListInvoicesAll(c.Request.Context())
		if err != nil {

			return
		}

		if invoice == nil {
			c_errors.NewErrorH(c, err)
			return
		}
		for i := 0; i < len(invoice); i++ {
			invoice[i].Mask()
		}
		c_errors.NewSuccessH(c, invoice)

	}
}
