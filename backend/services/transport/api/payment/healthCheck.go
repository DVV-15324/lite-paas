package payment

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func (a *ApiPayment) HealthCheck() func(c *gin.Context) {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"service":   "VNPay Payment Gateway",
			"timestamp": time.Now().Format(time.RFC3339),
		})
	}
}
