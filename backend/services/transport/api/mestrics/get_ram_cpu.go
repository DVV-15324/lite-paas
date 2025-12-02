package mestrics

import (
	"fmt"
	"github.com/gin-gonic/gin"
	c_ctx "lite-paas/common/ctx"
	c_errors "lite-paas/common/errors"
	c_uid "lite-paas/common/uid"
	c_utils "lite-paas/common/utils"
	"strings"
)

func (api *ApiMestrics) ApiGetRamCpu() func(c *gin.Context) {
	return func(c *gin.Context) {
		idService := c.Param("id")
		//uidSv := c_uid.DecodeFromBase58(idService)

		id := c_ctx.GetRequestContext(c.Request.Context()).GetSub()
		uid := c_uid.DecodeFromBase58(id)

		user, _ := api.bzUser.BzGetUsersById(c, int(uid.LocalID))
		appName := fmt.Sprintf("%s-%s", strings.ReplaceAll(strings.ToLower(user.Name), " ", ""), idService)
		data, _ := api.mestrics.GetPodRuntimeMetrics(c_utils.SanitizeK8sName(appName), "user")

		c_errors.NewSuccessH(c, data)

	}
}
