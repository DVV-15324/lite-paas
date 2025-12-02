package runtimesub

import (
	c_ctx "lite-paas/common/ctx"
	c_uid "lite-paas/common/uid"
	entityRuntimeSub "lite-paas/services/entity/runtime_sub"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (api *ApiRuntimeSub) GetRuntimeSubsByUser() func(c *gin.Context) {
	return func(c *gin.Context) {
		id := c_ctx.GetRequestContext(c.Request.Context()).GetSub()
		uid := c_uid.DecodeFromBase58(id)

		subscriptions, err := api.bz.GetRuntimeSubsByUser(c.Request.Context(), int64(uid.LocalID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Trả về mảng rỗng nếu không có subscriptions thay vì null
		if subscriptions == nil {
			subscriptions = []*entityRuntimeSub.RuntimeSubscription{}
		}
		for i := 0; i < len(subscriptions); i++ {
			subscriptions[i].Mask()
		}
		c.JSON(http.StatusOK, subscriptions)
	}
}
