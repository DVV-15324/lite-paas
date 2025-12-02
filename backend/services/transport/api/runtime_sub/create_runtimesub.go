package runtimesub

/*
import (
	entityRuntimeSub "bncloud/services/entity/runtime_sub"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (api *ApiRuntimeSub) CreateNewRuntimeSub(c *gin.Context) {
	var req entityRuntimeSub.CreateRuntimeSubscription
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id, err := api.bz.CreateNewRuntimeSub(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":      id,
		"message": "Runtime subscription created successfully",
	})
}
*/
