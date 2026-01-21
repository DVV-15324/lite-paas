package runtime

import (
	"context"
	"fmt"
	"log"
	//	"strings"

	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/wait"
	c_utils "lite-paas/shared/utils"
	"time"
)

func (k *K8sManagerRuntime) DeployApp(appName, image string, basedomain string, port int32, memoryLimit int, cpuLimit float64) (string, error) {
	fullHost := fmt.Sprintf("%s.%s", c_utils.SanitizeK8sName(appName), basedomain)

	// Clean up any existing resources first
	if err := k.cleanupExistingResources(appName); err != nil {
		return "", fmt.Errorf("failed to cleanup existing resources: %v", err)
	}

	// Create Pods
	if err := k.CreatePod(appName, image, port, memoryLimit, cpuLimit); err != nil {
		log.Printf("Failed to create deployment: %v", err)
		return "", fmt.Errorf("failed to create deployment: %v", err)
	}

	// Create service
	if err := k.CreateService(appName, port); err != nil {
		log.Printf("Failed to create service: %v", err)
		return "", fmt.Errorf("failed to create service: %v", err)
	}

	// Create ingress - use port 80 for ingress
	if err := k.CreateIngress(appName, fullHost, 8080); err != nil {
		log.Printf("Failed to create ingress: %v", err)
		return "", fmt.Errorf("failed to create ingress: %v", err)
	}

	log.Printf("Deployment successful: %s -> %s", appName, fullHost)
	return fullHost, nil
}
func (k *K8sManagerRuntime) cleanupExistingResources(appName string) error {
	ctx := context.TODO()

	// Delete existing pods
	err := k.clientset.CoreV1().Pods(k.namespace).DeleteCollection(ctx, metav1.DeleteOptions{}, metav1.ListOptions{
		LabelSelector: fmt.Sprintf("app=%s", appName),
	})
	if err != nil && !errors.IsNotFound(err) {
		log.Printf("Failed to delete existing pods: %v", err)
	}

	// Wait until all pods are deleted
	err = wait.PollImmediate(1*time.Second, 10*time.Second, func() (bool, error) {
		pods, err := k.clientset.CoreV1().Pods(k.namespace).List(ctx, metav1.ListOptions{
			LabelSelector: fmt.Sprintf("app=%s", appName),
		})
		if err != nil {
			return false, err
		}
		return len(pods.Items) == 0, nil
	})
	if err != nil {
		log.Printf("Pods still exist after deletion: %v", err)
	}

	// Delete existing service
	err = k.clientset.CoreV1().Services(k.namespace).Delete(ctx, appName, metav1.DeleteOptions{})
	if err != nil && !errors.IsNotFound(err) {
		log.Printf("Failed to delete existing service: %v", err)
	}

	// Delete existing ingress
	err = k.clientset.NetworkingV1().Ingresses(k.namespace).Delete(ctx, appName, metav1.DeleteOptions{})
	if err != nil && !errors.IsNotFound(err) {
		log.Printf("Failed to delete existing ingress: %v", err)
	}

	return nil
}
