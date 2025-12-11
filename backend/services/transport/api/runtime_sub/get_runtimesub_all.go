package runtimesub

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (api *ApiRuntimeSub) ApiGetRuntimeSubsAll() func(c *gin.Context) {
	return func(c *gin.Context) {

		runsub, err := api.bz.GetRuntimeSubsAll(c.Request.Context())

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		for i := 0; i < len(runsub); i++ {
			runsub[i].Mask()
		}

		c.JSON(http.StatusOK, runsub)
	}
}
