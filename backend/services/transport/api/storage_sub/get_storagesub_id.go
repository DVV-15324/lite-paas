package storagesub

import (
	"fmt"
	c_ctx "lite-paas/common/ctx"
	c_uid "lite-paas/common/uid"

	"net/http"

	"github.com/gin-gonic/gin"
)

func (api *ApiStorageSub) ApiGetStorageSubsById() func(c *gin.Context) {
	return func(c *gin.Context) {
		id_s := c.Param("id")
		uid_s := c_uid.DecodeFromBase58(id_s)

		id := c_ctx.GetRequestContext(c.Request.Context()).GetSub()
		uid := c_uid.DecodeFromBase58(id)
		subscriptions, err := api.bz.GetStorageSubsById(c.Request.Context(), int64(uid_s.LocalID), int64(uid.LocalID))

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		fmt.Println(uid.LocalID)
		subscriptions.Mask()
		c.JSON(http.StatusOK, subscriptions)
	}
}
