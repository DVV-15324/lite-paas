package runtimesub

import (
	"github.com/gin-gonic/gin"
	entityRuntimeSub "lite-paas/modules/runtime_sub/entity"
	c_ctx "lite-paas/shared/context"
	c_errors "lite-paas/shared/errors"
	c_uid "lite-paas/shared/uid"
)

func (api *ApiRuntimeSub) GetRuntimeSubsByUser() func(c *gin.Context) {
	return func(c *gin.Context) {
		id := c_ctx.GetRequestContext(c.Request.Context()).GetSub()
		uid := c_uid.DecodeFromBase58(id)

		subscriptions, err := api.bz.BzGetRuntimeSubsByUser(c.Request.Context(), int64(uid.LocalID))
		if err != nil {
			c_errors.NewErrorH(c, err)
			return
		}

		// Trả về mảng rỗng nếu không có subscriptions thay vì null
		if subscriptions == nil {
			subscriptions = []*entityRuntimeSub.RuntimeSubscription{}
		}
		for i := 0; i < len(subscriptions); i++ {
			subscriptions[i].Mask()
		}
		c_errors.NewSuccessH(c, subscriptions)
	}
}
