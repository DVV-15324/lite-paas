package runtime

import (
	"context"
	"io"

	"github.com/gin-gonic/gin"
	corev1 "k8s.io/api/core/v1"
)

func GetPodLogs(c *gin.Context) {
	pod := c.Param("pod")
	ns := "user"

	tail := int64(10)
	k8s, err := NewK8sManagerRuntime(ns, "example.com", "./infrastructure/k8s/config.yaml")
	if err != nil {

		return
	}

	req := k8s.clientset.CoreV1().
		Pods(ns).
		GetLogs(pod, &corev1.PodLogOptions{
			TailLines: &tail,
		})

	stream, err := req.Stream(context.Background())
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer stream.Close()

	data, err := io.ReadAll(stream)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Kubernetes logs = TEXT
	c.String(200, string(data))
}
