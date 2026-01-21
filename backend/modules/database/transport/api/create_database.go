package database

import (
	"github.com/gin-gonic/gin"
	entityDatabase "lite-paas/modules/database/entity"
	c_errors "lite-paas/shared/errors"
)

func (api *ApiDatabase) ApiCreateDatabase() func(c *gin.Context) {
	return func(c *gin.Context) {
		var req entityDatabase.CreateDatabaseService
		if err := c.ShouldBindJSON(&req); err != nil {
			return
		}

		err := api.bz.BzCreateDatabase(c.Request.Context(), &req)
		if err != nil {
			c_errors.NewErrorH(c, err)
			return
		}
		c_errors.NewSuccessH(c, "tao storage thanh cong")

	}
}
