package api

import (
	"github.com/gin-gonic/gin"
	entityRuntimeEnv "lite-paas/modules/runtime_env/entity"
	c_errors "lite-paas/shared/errors"
	c_uid "lite-paas/shared/uid"
)

func (api *ApiRuntimeEnv) ApiCreateRuntimeEnv() func(c *gin.Context) {
	return func(c *gin.Context) {
		req := entityRuntimeEnv.CreateRuntimeEnv{}
		if err := c.ShouldBindJSON(&req); err != nil {
			return
		}
		id := c.Param("id")

		uid := c_uid.DecodeFromBase58(id)
		err := api.bz.BzCreateRuntimeEnv(c.Request.Context(), &req, int(uid.LocalID))
		if err != nil {
			c_errors.NewErrorH(c, err)
			return
		}
		c_errors.NewSuccessH(c, "tao runtime env thanh cong")

	}
}
