package database

import (
	entityDatabase "lite-paas/modules/database/entity"
	c_errors "lite-paas/shared/errors"

	"github.com/gin-gonic/gin"
)

func (api *ApiDatabase) ApiGetAllDatabase() func(c *gin.Context) {
	return func(c *gin.Context) {
		storages, err := api.bz.BzGetAllDatabase(c.Request.Context())
		if err != nil {
			return
		}

		// Trả về mảng rỗng nếu không có storage services thay vì null
		if storages == nil {
			storages = []*entityDatabase.DatabaseService{}
		}
		for i := 0; i < len(storages); i++ {
			storages[i].Mask()
		}
		c_errors.NewSuccessH(c, storages)

	}
}
