package runtimesub

import (
	entityRuntimeSub "lite-paas/modules/runtime_sub/entity"
	c_ctx "lite-paas/shared/context"

	"github.com/gin-gonic/gin"
	c_errors "lite-paas/shared/errors"
	c_uid "lite-paas/shared/uid"
	"net/http"
)

func (api *ApiRuntimeSub) UpdateRuntimeSub() func(c *gin.Context) {
	return func(c *gin.Context) {

		id := c.Param("id")

		var req entityRuntimeSub.UpdateRuntimeSubscription
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		id_user := c_ctx.GetRequestContext(c.Request.Context())
		uid := c_uid.DecodeFromBase58(id_user.GetSub())

		id_sv := c_uid.DecodeFromBase58(id)
		err_u := api.bz.BzUpdateRuntimeSub(c.Request.Context(), int(id_sv.LocalID), int(uid.LocalID), &req, "user", "example.com")
		if err_u != nil {
			c_errors.NewErrorH(c, err_u)

			return
		}
		c_errors.NewSuccessH(c, "Runtime updated successfully")

	}
}
