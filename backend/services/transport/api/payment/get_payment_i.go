package payment

import (
	entityPayment "lite-paas/services/entity/payment"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (api *ApiPayment) GetPaymentsByInvoice(c *gin.Context) {
	invoiceID, err := strconv.ParseInt(c.Param("invoice_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice ID"})
		return
	}

	payments, err := api.bz.GetPaymentsByInvoice(c.Request.Context(), invoiceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Trả về mảng rỗng nếu không có payments thay vì null
	if payments == nil {
		payments = []*entityPayment.Payment{}
	}

	c.JSON(http.StatusOK, payments)
}
