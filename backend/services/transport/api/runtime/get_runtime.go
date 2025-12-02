package runtime

import (
	entityRuntime "lite-paas/services/entity/runtime"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (api *ApiRuntime) ApiGetAllRuntime() func(c *gin.Context) {
	return func(c *gin.Context) {
		runtimes, err := api.bz.GetAllRuntime(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Trả về mảng rỗng nếu không có runtimes thay vì null
		if runtimes == nil {
			runtimes = []*entityRuntime.RuntimeService{}
		}
		for i := 0; i < len(runtimes); i++ {
			runtimes[i].Mask()
		}
		c.JSON(http.StatusOK, runtimes)
	}
}
