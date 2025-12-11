package runtime

import (
	"github.com/gin-gonic/gin"
	c_uid "lite-paas/common/uid"
	entityRuntime "lite-paas/services/entity/runtime"
	"net/http"
)

func (api *ApiRuntime) ApiUpdateRuntime() func(c *gin.Context) {
	return func(c *gin.Context) {
		id_s := c.Param("id")
		uid_s := c_uid.DecodeFromBase58(id_s)

		var req entityRuntime.UpdateRuntime
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := api.bz.UpdateRuntime(c.Request.Context(), int(uid_s.LocalID), &req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Runtime updated successfully"})
	}
}
