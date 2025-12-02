package ticket_message

import (
	"github.com/gin-gonic/gin"
	c_uid "lite-paas/common/uid"
	entityTicketMessage "lite-paas/services/entity/ticket_message"
	"net/http"
)

func (api *ApiTicketMessage) ApiGetMessagesByTicket() func(c *gin.Context) {
	return func(c *gin.Context) {
		ticketID := c.Param("id")
		uid := c_uid.DecodeFromBase58(ticketID)

		messages, err := api.bz.GetMessagesByTicket(c.Request.Context(), int64(uid.LocalID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Trả về mảng rỗng nếu không có messages thay vì null
		if messages == nil {
			messages = []*entityTicketMessage.TicketMessage{}
		}
		for i := 0; i < len(messages); i++ {
			messages[i].Mask()
		}
		c.JSON(http.StatusOK, messages)
	}
}
