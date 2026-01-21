package auth

import (
	c_errors "lite-paas/shared/errors"

	entityAuth "lite-paas/modules/auths/entity"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (api *ApiAuth) ApiLoginAuth() func(c *gin.Context) {
	return func(c *gin.Context) {
		var data entityAuth.LoginForm
		//lấy dữ liệu
		err := c.ShouldBindJSON(&data)
		if err != nil {
			app := c_errors.NewAppError(400, http.StatusText(400), err)
			c_errors.NewErrorH(c, app)
			return
		}
		claims, er := api.bz.BzLoginAuth(c, &data)
		if er != nil {
			c_errors.NewErrorH(c, er)
			return
		}
		c_errors.NewSuccessH(c, claims)

	}
}
