package runtime

import (
	entityRuntime "lite-paas/services/entity/runtime"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (api *ApiRuntime) ApiCreateRuntime() func(c *gin.Context) {
	return func(c *gin.Context) {
		var req entityRuntime.CreateRuntime
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := api.bz.CreateRuntime(c.Request.Context(), &req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Runtime created successfully",
		})
	}
}
