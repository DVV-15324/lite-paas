package auth

import (
	c_errors "lite-paas/common/errors"

	entityAuth "lite-paas/services/entity/auth"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (api *ApiAuth) ApiRegisterAuth() func(c *gin.Context) {
	return func(c *gin.Context) {
		var data entityAuth.RegisterForm
		//lấy dữ liệu
		err := c.ShouldBindJSON(&data)
		if err != nil {
			app := c_errors.NewAppError(400, http.StatusText(400), err)
			c_errors.NewErrorH(c, app)
			return
		}
		// dang ki
		er := api.bz.BzRegisterAuth(c, &data)
		if er != nil {
			c_errors.NewErrorH(c, er)
			return
		}
		c_errors.NewSuccessH(c, "Dang ki thanh cong")
	}
}
