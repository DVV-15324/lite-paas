package auth

import (
	c_errors "lite-paas/shared/errors"
	"strconv"

	"github.com/gin-gonic/gin"

	c_uid "lite-paas/shared/uid"
)

func (api *ApiAuth) ApiAuthBanned() func(c *gin.Context) {
	return func(c *gin.Context) {

		id := c.Param("id")
		ban := c.Param("ban")
		uid := c_uid.DecodeFromBase58(id)
		sta, _ := strconv.Atoi(ban)
		er := api.bz.BzUpdateAuthBanned(c, sta, int(uid.LocalID))
		if er != nil {
			c_errors.NewErrorH(c, er)
			return
		}
		mess := "da banned thanh cong"
		if sta == 0 {
			mess = "da bo banned thanh cong"
		}
		c_errors.NewSuccessH(c, mess)

	}
}
