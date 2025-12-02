package user

import (
	c_ctx "lite-paas/common/ctx"
	c_errors "lite-paas/common/errors"
	c_uid "lite-paas/common/uid"

	"github.com/gin-gonic/gin"
)

func (api *ApiUser) ApiGetUserById() func(c *gin.Context) {
	return func(c *gin.Context) {
		//uid := common.DecodeFromBase58(id)
		id := c_ctx.GetRequestContext(c.Request.Context()).GetSub()
		uid := c_uid.DecodeFromBase58(id)
		user, er := api.bz.BzGetUsersById(c, int(uid.LocalID))
		if er != nil {
			c_errors.NewErrorH(c, er)
			return
		}

		user.Mask()

		c_errors.NewSuccessH(c, user)

	}
}
