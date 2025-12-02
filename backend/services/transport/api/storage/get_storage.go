package storage

import (
	entityStorage "lite-paas/services/entity/storage"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (api *ApiStorage) ApiGetAllStorage() func(c *gin.Context) {
	return func(c *gin.Context) {
		storages, err := api.bz.GetAllStorage(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Trả về mảng rỗng nếu không có storage services thay vì null
		if storages == nil {
			storages = []*entityStorage.StorageService{}
		}
		for i := 0; i < len(storages); i++ {
			storages[i].Mask()
		}

		c.JSON(http.StatusOK, storages)
	}
}
