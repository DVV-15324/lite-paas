package user

import (
	c_errors "lite-paas/shared/errors"

	c_uid "lite-paas/shared/uid"

	"github.com/gin-gonic/gin"
)

func (api *ApiUser) ApiGetUserByIdPublic() func(c *gin.Context) {
	return func(c *gin.Context) {
		//uid := shared.DecodeFromBase58(id)
		id := c.Param("id")
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
