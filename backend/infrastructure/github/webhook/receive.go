package webhook

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
	entity "lite-paas/infrastructure/github/entity"

	entityRuntimeSub "lite-paas/modules/runtime_sub/entity"
	c_errors "lite-paas/shared/errors"

	"net/http"
)

func (h *WebhookHandler) ReceiveWebhook() func(c *gin.Context) {
	return func(c *gin.Context) {
		contentType := c.GetHeader("Content-Type")
		var payload []byte
		var err error
		if contentType == "application/x-www-form-urlencoded" {
			payloadStr := c.PostForm("payload")
			payload = []byte(payloadStr)
		} else {
			payload, err = io.ReadAll(c.Request.Body)
			if err != nil {
				c.String(http.StatusBadRequest, "lỗi : %v", err)
				return
			}
		}
		var event entity.PushEvent
		if err := json.Unmarshal(payload, &event); err != nil {
			c.String(http.StatusBadRequest, "unmarshal error: %v", err)
			return
		}

		fmt.Printf("Repository: %s\nPusher: %s (%s)\n Ref: %s\n",
			event.Repository.FullName, event.Pusher.Name, event.Pusher.Email, event.Ref)
		if !h.isMainBranch(event.Ref) {
			fmt.Println("Not main/master branch, skipping clone")
			c.String(http.StatusOK, "ignored non-main branch")
			return
		}
		fmt.Println(event.Repository.CloneURL)
		infoRuntimeSub, _ := h.bzRuntimeSub.BzGetRuntimeSubsByLinkGit(c.Request.Context(), event.Repository.CloneURL)
		fmt.Println(infoRuntimeSub.Id)
		req := entityRuntimeSub.UpdateRuntimeSubscription{}
		err_u := h.bzRuntimeSub.BzUpdateRuntimeSub(c.Request.Context(), int(infoRuntimeSub.Id), int(infoRuntimeSub.UserId), &req, "user", "example.com")
		if err_u != nil {
			c_errors.NewErrorH(c, err_u)

			return
		}
		c.String(http.StatusOK, "Runtime updated successfully")
	}
}
