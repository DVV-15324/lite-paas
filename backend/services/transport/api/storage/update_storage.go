package storage

import (
	c_uid "lite-paas/common/uid"
	entityStorage "lite-paas/services/entity/storage"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (api *ApiStorage) ApiUpdateStorage() func(c *gin.Context) {
	return func(c *gin.Context) {
		id_s := c.Param("id")
		uid_s := c_uid.DecodeFromBase58(id_s)

		var req entityStorage.UpdateStorageService
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := api.bz.UpdateStorage(c.Request.Context(), int(uid_s.LocalID), &req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Storage service updated successfully"})
	}
}
