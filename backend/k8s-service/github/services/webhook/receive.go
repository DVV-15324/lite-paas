package webhook

// import (
// 	hub "lite-paas/common/hub"
// 	entity "lite-paas/k8s-service/github/services/entity"
// 	k8smanager "lite-paas/k8s-service/k8s-manager"
// 	t "lite-paas/k8s-service/templates/docker"
// 	"encoding/json"
// 	"fmt"
// 	"github.com/gin-gonic/gin"
// 	"io"
// 	"log"
// 	"net/http"
// )

// func (h *WebhookHandler) ReceiveWebhook() func(c *gin.Context) {
// 	return func(c *gin.Context) {
// 		contentType := c.GetHeader("Content-Type")
// 		var payload []byte
// 		var err error
// 		if contentType == "application/x-www-form-urlencoded" {
// 			payloadStr := c.PostForm("payload")
// 			payload = []byte(payloadStr)
// 		} else {
// 			payload, err = io.ReadAll(c.Request.Body)
// 			if err != nil {
// 				c.String(http.StatusBadRequest, "lỗi : %v", err)
// 				return
// 			}
// 		}
// 		var event entity.PushEvent
// 		if err := json.Unmarshal(payload, &event); err != nil {
// 			c.String(http.StatusBadRequest, "unmarshal error: %v", err)
// 			return
// 		}

// 		fmt.Printf("Repository: %s\nPusher: %s (%s)\n Ref: %s\n",
// 			event.Repository.FullName, event.Pusher.Name, event.Pusher.Email, event.Ref)
// 		if !h.isMainBranch(event.Ref) {
// 			fmt.Println("Not main/master branch, skipping clone")
// 			c.String(http.StatusOK, "ignored non-main branch")
// 			return
// 		}
// 		//var user = "idinwebsite"
// 		var app = "test-app"
// 		//var port = 8080
// 		var namespace = "use"
// 		var baseDomain = "abcd.local"
// 		hub := hub.NewServiceHub()
// 		go hub.Run()
// 		k8s, err := k8smanager.NewK8sManager(namespace, baseDomain, "./k8s-service/config.yaml", hub)
// 		if err != nil {
// 			log.Printf("Failed to connect to Kubernetes: %v", err)
// 			c.String(http.StatusInternalServerError, "Failed to connect to Kubernetes")
// 			return
// 		}
// 		log.Println("Connected to Kubernetes cluster")
// 		e := k8s.EnsureNamespace()
// 		if e != nil {
// 			log.Println("loi namespaces")
// 			c.String(http.StatusInternalServerError, "Failed ")
// 			return
// 		}
// 		token := "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"
// 		err_kaniko := k8s.CreateKanikoJob(app, event.Repository.Name, event.Repository.Owner.Name, token, t.TempDockerGoLang())
// 		if err_kaniko != nil {
// 			log.Printf("Failed to create Kaniko job: %v", err_kaniko)
// 			c.String(http.StatusInternalServerError, "Failed to create Kaniko job")
// 			return
// 		}
// 		fmt.Println("Kaniko job created successfully")
// 		go func() {
// 			//k8s.WatchJob(app, user, int32(port))
// 		}()
// 		c.String(http.StatusOK, "Webhook received, Kaniko job created")
// 	}
//}
