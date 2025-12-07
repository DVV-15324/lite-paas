package auth

import (
	c_errors "lite-paas/common/errors"

	entityAuth "lite-paas/services/entity/auth"
	"net/http"

	"github.com/gin-gonic/gin"
	c_ctx "lite-paas/common/ctx"
	c_uid "lite-paas/common/uid"
)

func (api *ApiAuth) ApiAuthChange() func(c *gin.Context) {
	return func(c *gin.Context) {
		id := c_ctx.GetRequestContext(c.Request.Context())
		uid := c_uid.DecodeFromBase58(id.GetSub())
		var data entityAuth.ChangePasswordForm
		err := c.ShouldBindJSON(&data)
		if err != nil {
			app := c_errors.NewAppError(400, http.StatusText(400), err)
			c_errors.NewErrorH(c, app)
			return
		}
		er := api.bz.BzUpdateChangeAuth(c, &data, int(uid.LocalID))
		if er != nil {
			c_errors.NewErrorH(c, er)
			return
		}
		mess := "thay doi mat khau thanh cong"
		c_errors.NewSuccessH(c, mess)

	}
}
