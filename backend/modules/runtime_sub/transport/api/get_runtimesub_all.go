package runtimesub

import (
	"github.com/gin-gonic/gin"
	c_errors "lite-paas/shared/errors"
)

func (api *ApiRuntimeSub) ApiGetRuntimeSubsAll() func(c *gin.Context) {
	return func(c *gin.Context) {

		runsub, err := api.bz.BzGetRuntimeSubsAll(c.Request.Context())

		if err != nil {
			c_errors.NewErrorH(c, err)
			return
		}
		for i := 0; i < len(runsub); i++ {
			runsub[i].Mask()
		}
		c_errors.NewSuccessH(c, runsub)
	}
}
