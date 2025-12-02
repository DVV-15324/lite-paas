package invoice

import (
	c_ctx "lite-paas/common/ctx"

	c_uid "lite-paas/common/uid"

	"github.com/gin-gonic/gin"
	entityInvoice "lite-paas/services/entity/invoice"
	"net/http"
)

func (api *ApiInvoice) ApiCreateInvoice() func(c *gin.Context) {
	return func(c *gin.Context) {
		var req entityInvoice.CreateInvoice
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		uid_sv := c_uid.DecodeFromBase58(req.FakeServiceId)
		req.ServiceID = int64(uid_sv.LocalID)
		id := c_ctx.GetRequestContext(c.Request.Context()).GetSub()
		uid := c_uid.DecodeFromBase58(id)

		_, err := api.bz.CreateInvoice(c.Request.Context(), &req, int64(uid.LocalID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"id": "tao thanh cong"})
	}
}
