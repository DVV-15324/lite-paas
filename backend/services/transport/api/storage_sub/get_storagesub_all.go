package storagesub

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (api *ApiStorageSub) ApiGetStorageSubsAll() func(c *gin.Context) {
	return func(c *gin.Context) {

		subscriptions, err := api.bz.GetStorageSubsAll(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		for i := 0; i < len(subscriptions); i++ {
			subscriptions[i].Mask()
		}

		c.JSON(http.StatusOK, subscriptions)
	}
}
