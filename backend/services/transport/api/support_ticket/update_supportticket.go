package support_ticket

import (
	entitySupportTicket "lite-paas/services/entity/support_ticket"
	"net/http"
	//"strconv"

	"github.com/gin-gonic/gin"
	c_uid "lite-paas/common/uid"
)

func (api *ApiSupportTicket) ApiUpdateTicket() func(c *gin.Context) {
	return func(c *gin.Context) {

		ticket_id := c.Param("id")
		var req entitySupportTicket.UpdateSupportTicket
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		ticket_uid := c_uid.DecodeFromBase58(ticket_id)
		//Set ID từ path parameter vào ticket object
		//req.Content = id

		err := api.bz.UpdateTicket(c.Request.Context(), &req, int(ticket_uid.LocalID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Support ticket updated successfully"})
	}
}
