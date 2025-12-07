package support_ticket

import (
	c_ctx "lite-paas/common/ctx"
	c_uid "lite-paas/common/uid"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (api *ApiSupportTicket) ApiGetTicketsByUserID() func(c *gin.Context) {
	return func(c *gin.Context) {
		id := c_ctx.GetRequestContext(c.Request.Context()).GetSub()
		uid := c_uid.DecodeFromBase58(id)

		ticket, err := api.bz.GetTicketsByUserID(c.Request.Context(), int64(uid.LocalID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if ticket == nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Support ticket not found"})
			return
		}
		for i := 0; i < len(ticket); i++ {
			ticket[i].Mask()

		}
		c.JSON(http.StatusOK, ticket)
	}
}
