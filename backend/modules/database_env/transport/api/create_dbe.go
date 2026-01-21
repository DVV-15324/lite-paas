package api

import (
	"github.com/gin-gonic/gin"
	entityDatabase "lite-paas/modules/database_env/entity"
	c_errors "lite-paas/shared/errors"
	c_uid "lite-paas/shared/uid"
)

func (api *ApiDatabaseEnv) ApiCreateDatabaseEnv() func(c *gin.Context) {
	return func(c *gin.Context) {
		var req entityDatabase.CreateDatabaseEnv
		if err := c.ShouldBindJSON(&req); err != nil {
			return
		}
		id := c.Param("id")

		uid := c_uid.DecodeFromBase58(id)
		err := api.bz.BzCreateDatabaseEnv(c.Request.Context(), &req, int(uid.LocalID))
		if err != nil {
			c_errors.NewErrorH(c, err)
			return
		}
		c_errors.NewSuccessH(c, "tao database env thanh cong")

	}
}
