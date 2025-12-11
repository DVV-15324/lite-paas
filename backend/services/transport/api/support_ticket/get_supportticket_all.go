package support_ticket

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (api *ApiSupportTicket) ApiGetTicketsAll() func(c *gin.Context) {
	return func(c *gin.Context) {

		ticket, err := api.bz.GetTicketsAll(c.Request.Context())
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
