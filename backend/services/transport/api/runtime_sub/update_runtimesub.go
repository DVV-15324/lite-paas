package runtimesub

import (
	c_ctx "lite-paas/common/ctx"
	entityRuntimeSub "lite-paas/services/entity/runtime_sub"

	"github.com/gin-gonic/gin"
	"net/http"

	c_uid "lite-paas/common/uid"
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
		err_u := api.bz.UpdateRuntimeSub(c.Request.Context(), int(id_sv.LocalID), int(uid.LocalID), &req, "user", "example.com")
		if err_u != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err_u.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Runtime updated successfully"})

	}
}
