package runtimesub

import (
	c_uid "lite-paas/common/uid"

	"net/http"

	"github.com/gin-gonic/gin"
)

func (api *ApiRuntimeSub) ApiGetRuntimeSubsById() func(c *gin.Context) {
	return func(c *gin.Context) {
		id_s := c.Param("id")
		uid_s := c_uid.DecodeFromBase58(id_s)

		runsub, err := api.bz.GetRuntimeSubsById(c.Request.Context(), int64(uid_s.LocalID))

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		runsub.Mask()
		c.JSON(http.StatusOK, runsub)
	}
}
