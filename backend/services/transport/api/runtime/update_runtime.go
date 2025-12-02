package runtime

import (
	entityRuntime "lite-paas/services/entity/runtime"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (api *ApiRuntime) ApiUpdateRuntime() func(c *gin.Context) {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid runtime ID"})
			return
		}

		var req entityRuntime.UpdateRuntime
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err = api.bz.UpdateRuntime(c.Request.Context(), id, &req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Runtime updated successfully"})
	}
}
