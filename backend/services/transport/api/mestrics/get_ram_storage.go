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

func (api *ApiMestrics) ApiGetRamStorage() func(c *gin.Context) {
	return func(c *gin.Context) {
		idIvnService := c.Param("id")
		idIvnServiceType := c.Param("type")
		//uidSv := c_uid.DecodeFromBase58(idService)

		id := c_ctx.GetRequestContext(c.Request.Context()).GetSub()
		uid := c_uid.DecodeFromBase58(id)

		user, _ := api.bzUser.BzGetUsersById(c, int(uid.LocalID))
		appName := fmt.Sprintf("%s-%s", strings.ReplaceAll(strings.ToLower(user.Name), " ", ""), idIvnService)
		data, _ := api.mestrics.GetPodFullMetrics(c_utils.SanitizeK8sName(appName), "db", idIvnServiceType)

		c_errors.NewSuccessH(c, data)

	}
}
