package invoice

import (
	c_ctx "lite-paas/shared/context"

	"github.com/gin-gonic/gin"
	entityInvoice "lite-paas/modules/invoices/entity"
	c_errors "lite-paas/shared/errors"
	c_uid "lite-paas/shared/uid"
)

func (api *ApiInvoice) ApiCreateInvoice() func(c *gin.Context) {
	return func(c *gin.Context) {
		var req entityInvoice.CreateInvoice
		if err := c.ShouldBindJSON(&req); err != nil {

			return
		}

		uid_sv := c_uid.DecodeFromBase58(req.FakeServiceId)
		req.ServiceID = int64(uid_sv.LocalID)
		id := c_ctx.GetRequestContext(c.Request.Context()).GetSub()
		uid := c_uid.DecodeFromBase58(id)

		_, err := api.bz.BzCreateInvoice(c.Request.Context(), &req, int64(uid.LocalID))
		if err != nil {
			c_errors.NewErrorH(c, err)
			return
		}
		c_errors.NewSuccessH(c, "tao thanh cong")
	}
}
