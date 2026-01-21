package runtimesub

import (
	c_errors "lite-paas/shared/errors"
	c_uid "lite-paas/shared/uid"

	"github.com/gin-gonic/gin"
)

func (api *ApiRuntimeSub) ApiGetRuntimeSubsById() func(c *gin.Context) {
	return func(c *gin.Context) {
		id_s := c.Param("id")
		uid_s := c_uid.DecodeFromBase58(id_s)

		runsub, err := api.bz.BzGetRuntimeSubsById(c.Request.Context(), int64(uid_s.LocalID))

		if err != nil {
			c_errors.NewErrorH(c, err)
			return
		}

		runsub.Mask()
		c_errors.NewSuccessH(c, runsub)
	}
}
