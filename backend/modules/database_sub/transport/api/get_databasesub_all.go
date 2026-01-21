package database_sub

import (
	"github.com/gin-gonic/gin"
	c_errors "lite-paas/shared/errors"
)

func (api *ApiDatabaseSub) ApiGetDatabaseSubsAll() func(c *gin.Context) {
	return func(c *gin.Context) {

		subscriptions, err := api.bz.BzGetDatabaseSubsAll(c.Request.Context())

		if err != nil {
			c_errors.NewErrorH(c, err)
			return
		}
		for i := 0; i < len(subscriptions); i++ {
			subscriptions[i].Mask()
		}
		c_errors.NewSuccessH(c, subscriptions)
	}
}
