// handlers/logs_handler.go
package logpods

import (
	"github.com/gin-gonic/gin"
	k8sLogsPod "lite-paas/k8s-service/k8s-manager/runtime"
	"net/http"
)

type LogsHandler struct {
	k8sManager *k8sLogsPod.K8sManagerRuntime
}

func NewLogsHandler(k8sManager *k8sLogsPod.K8sManagerRuntime) *LogsHandler {
	return &LogsHandler{
		k8sManager: k8sManager,
	}
}

func (h *LogsHandler) ApiGetAppLogs() func(c *gin.Context) {
	return func(c *gin.Context) {
		serviceId := c.Param("serviceId")
		appName := c.Param("appName")

		if appName == "" || serviceId == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "appName and serviceId are required",
			})
			return
		}

		// Gọi hàm GetAppLogsTail
		go h.k8sManager.GetAppLogsTail(appName, serviceId, 20)

		c.JSON(http.StatusOK, gin.H{
			"status":  "started",
			"message": "Fetching last 20 lines of logs",
			"app":     appName,
			"service": serviceId,
		})
	}
}
