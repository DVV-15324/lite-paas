package storagesub

/*
import (
	entityStorageSub "lite-paas/services/entity/storage_sub"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (api *ApiStorageSub) CreateNewStorageSub(c *gin.Context) {
	var req entityStorageSub.CreateStorageSubscription
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id, err := api.bz.CreateNewStorageSub(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":      id,
		"message": "Storage subscription created successfully",
	})
}
*/
