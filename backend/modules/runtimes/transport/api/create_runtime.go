package runtime

import (
	"github.com/gin-gonic/gin"
	entityRuntime "lite-paas/modules/runtimes/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (api *ApiRuntime) ApiCreateRuntime() func(c *gin.Context) {
	return func(c *gin.Context) {
		var req entityRuntime.CreateRuntime
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := api.bz.BzCreateRuntime(c.Request.Context(), &req)
		if err != nil {
			c_errors.NewErrorH(c, err)
			return
		}

		c_errors.NewSuccessH(c, "tao runtime thanh cong")
	}
}
