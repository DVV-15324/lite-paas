package user

import (
	c_errors "lite-paas/common/errors"

	"github.com/gin-gonic/gin"
)

func (api *ApiUser) ApiGetUserAll() func(c *gin.Context) {
	return func(c *gin.Context) {

		user, er := api.bz.BzGetUserAll(c)
		if er != nil {
			c_errors.NewErrorH(c, er)
			return
		}
		for i := 0; i < len(user); i++ {
			user[i].Mask()
		}

		c_errors.NewSuccessH(c, user)

	}
}
