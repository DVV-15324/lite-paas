package support_ticket

import (
	entitySupportTicket "lite-paas/services/entity/support_ticket"
	"net/http"

	"github.com/gin-gonic/gin"
	c_ctx "lite-paas/common/ctx"
	c_uid "lite-paas/common/uid"
)

func (api *ApiSupportTicket) ApiCreateNewTicket() func(c *gin.Context) {
	return func(c *gin.Context) {
		var req entitySupportTicket.CreateSupportTicket
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		id := c_ctx.GetRequestContext(c.Request.Context())
		uid := c_uid.DecodeFromBase58(id.GetSub())
		sv_id := c.Param("subid")
		sv_uid := c_uid.DecodeFromBase58(sv_id)
		_, err := api.bz.CreateNewTicket(c.Request.Context(), &req, int(uid.LocalID), int(sv_uid.LocalID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			//	"id":      id,
			"message": "Support ticket created successfully",
		})
	}
}
