package auth

import (
	c_errors "lite-paas/common/errors"
	"strconv"

	"github.com/gin-gonic/gin"

	c_uid "lite-paas/common/uid"
)

func (api *ApiAuth) ApiAuthChangeStatus() func(c *gin.Context) {
	return func(c *gin.Context) {

		id := c.Param("id")
		status := c.Param("status")
		uid := c_uid.DecodeFromBase58(id)
		sta, _ := strconv.Atoi(status)
		er := api.bz.BzUpdateChangeAuthStatus(c, sta, int(uid.LocalID))
		if er != nil {
			c_errors.NewErrorH(c, er)
			return
		}
		mess := "thay doi mat khau thanh cong"
		c_errors.NewSuccessH(c, mess)

	}
}
