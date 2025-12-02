package storage

import (
	entityStorage "lite-paas/services/entity/storage"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (api *ApiStorage) ApiCreateStorage() func(c *gin.Context) {
	return func(c *gin.Context) {
		var req entityStorage.CreateStorageService
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := api.bz.CreateStorage(c.Request.Context(), &req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Storage service created successfully",
		})
	}
}
