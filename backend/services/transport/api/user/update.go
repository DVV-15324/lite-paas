package user

import (
	c_errors "lite-paas/common/errors"

	c_ctx "lite-paas/common/ctx"
	c_uid "lite-paas/common/uid"
	entityUser "lite-paas/services/entity/user"
	//"fmt"

	"github.com/gin-gonic/gin"
)

func (api *ApiUser) ApiUpdateUser() func(c *gin.Context) {
	return func(c *gin.Context) {
		var data entityUser.UpdateUserForm

		//var id = c.Param("user-id")

		err := c.ShouldBindJSON(&data)
		if err != nil {
			return
		}
		id := c_ctx.GetRequestContext(c.Request.Context())
		uid := c_uid.DecodeFromBase58(id.GetSub())
		//fmt.Println(data)

		er := api.bz.BzUpdateUser(c, &data, int(uid.LocalID))
		if er != nil {
			c_errors.NewErrorH(c, er)
			return
		}
		c_errors.NewSuccessH(c, "Cap nhat thanh cong")

	}
}
