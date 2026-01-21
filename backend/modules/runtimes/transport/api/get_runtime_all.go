package runtime

import (
	"github.com/gin-gonic/gin"
	entityRuntime "lite-paas/modules/runtimes/entity"
	c_errors "lite-paas/shared/errors"
)

func (api *ApiRuntime) ApiGetAllRuntime() func(c *gin.Context) {
	return func(c *gin.Context) {
		runtimes, err := api.bz.BzGetAllRuntime(c.Request.Context())
		if err != nil {
			c_errors.NewErrorH(c, err)
			return
		}

		// Trả về mảng rỗng nếu không có runtimes thay vì null
		if runtimes == nil {
			runtimes = []*entityRuntime.RuntimeService{}
		}
		for i := 0; i < len(runtimes); i++ {
			runtimes[i].Mask()
		}
		c_errors.NewSuccessH(c, runtimes)
	}
}
