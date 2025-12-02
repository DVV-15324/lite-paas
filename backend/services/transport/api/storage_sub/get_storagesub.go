package storagesub

import (
	"fmt"
	c_ctx "lite-paas/common/ctx"
	c_uid "lite-paas/common/uid"

	entityStorageSub "lite-paas/services/entity/storage_sub"
	"net/http"

	"github.com/gin-gonic/gin"
)

func (api *ApiStorageSub) GetStorageSubsByUser() func(c *gin.Context) {
	return func(c *gin.Context) {
		id := c_ctx.GetRequestContext(c.Request.Context()).GetSub()
		uid := c_uid.DecodeFromBase58(id)
		subscriptions, err := api.bz.GetStorageSubsByUser(c.Request.Context(), int64(uid.LocalID))

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		fmt.Println(uid.LocalID)
		// Trả về mảng rỗng nếu không có subscriptions thay vì null
		if subscriptions == nil {
			subscriptions = []*entityStorageSub.StorageSubscription{}
		}
		for i := 0; i < len(subscriptions); i++ {
			subscriptions[i].Mask()
		}
		c.JSON(http.StatusOK, subscriptions)
	}
}
