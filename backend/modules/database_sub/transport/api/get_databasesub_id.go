package database_sub

import (
	c_ctx "lite-paas/shared/context"
	c_errors "lite-paas/shared/errors"
	c_uid "lite-paas/shared/uid"

	"github.com/gin-gonic/gin"
)

func (api *ApiDatabaseSub) ApiGetDatabaseSubsById() func(c *gin.Context) {
	return func(c *gin.Context) {
		id_s := c.Param("id")
		uid_s := c_uid.DecodeFromBase58(id_s)

		id := c_ctx.GetRequestContext(c.Request.Context()).GetSub()
		uid := c_uid.DecodeFromBase58(id)
		subscriptions, err := api.bz.BzGetDatabaseSubsById(c.Request.Context(), int64(uid_s.LocalID), int64(uid.LocalID))

		if err != nil {
			c_errors.NewErrorH(c, err)
			return
		}

		subscriptions.Mask()
		c_errors.NewSuccessH(c, subscriptions)
	}
}
