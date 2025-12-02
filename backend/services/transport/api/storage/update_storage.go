package storage

import (
	entityStorage "lite-paas/services/entity/storage"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (api *ApiStorage) ApiUpdateStorage() func(c *gin.Context) {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid storage service ID"})
			return
		}

		var req entityStorage.UpdateStorageService
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err = api.bz.UpdateStorage(c.Request.Context(), id, &req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Storage service updated successfully"})
	}
}
