// handlers/logs_handler.go
package logpods

import (
	"fmt"
	c_utils "lite-paas/common/utils"
	k8sStop "lite-paas/k8s-service/k8s-manager/stop"
	"net/http"

	"github.com/gin-gonic/gin"
)

type StopHandler struct {
	k8sManager *k8sStop.DeploymentManager
}

func NewLogsHandler(k8sManager *k8sStop.DeploymentManager) *StopHandler {
	return &StopHandler{
		k8sManager: k8sManager,
	}
}

func (h *StopHandler) ApiStartApp() func(c *gin.Context) {
	return func(c *gin.Context) {
		appName := c.Param("appName")
		namepaces := c.Param("namespace")

		if appName == "" || namepaces == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "appName and serviceId are required",
			})
			return
		}

		// Gọi hàm GetAppLogsTail
		h.k8sManager.StartDeployment(namepaces, c_utils.SanitizeK8sName(appName))

		c.JSON(http.StatusOK, gin.H{
			"status":  "started",
			"message": "Fetching last 20 lines of logs",
			"app":     appName,
			"service": namepaces,
		})
	}
}
func (h *StopHandler) ApiStopApp() func(c *gin.Context) {
	return func(c *gin.Context) {

		appName := c.Param("appName")
		namepaces := c.Param("namespace")

		if appName == "" || namepaces == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "appName and serviceId are required",
			})
			return
		}
		fmt.Println(appName, namepaces)
		// Gọi hàm GetAppLogsTail
		h.k8sManager.StopDeploymentHard(namepaces, c_utils.SanitizeK8sName(appName))

		c.JSON(http.StatusOK, gin.H{
			"status":  "started",
			"message": "Fetching last 20 lines of logs",
			"app":     appName,
			"service": namepaces,
		})
	}
}
