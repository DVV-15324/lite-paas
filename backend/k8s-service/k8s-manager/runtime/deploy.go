package runtime

import (
	"context"
	"fmt"
	"log"
	//	"strings"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/wait"
	c_utils "lite-paas/common/utils"
	"time"
)

func (k *K8sManagerRuntime) DeployApp(appName, image string, basedomain string, portApp int) (string, error) {
	fullHost := fmt.Sprintf("%s.%s", c_utils.SanitizeK8sName(appName), basedomain)
	port := int32(portApp)

	log.Printf("🚀 Starting deployment for app: %s with image: %s", appName, image)

	if err := k.EnsureNamespace(); err != nil {
		return "", fmt.Errorf("failed to ensure namespace: %v", err)
	}

	// Clean up any existing resources first
	if err := k.cleanupExistingResources(appName); err != nil {
		return "", fmt.Errorf("failed to cleanup existing resources: %v", err)
	}

	// Create deployment
	if err := k.CreateDeployment(appName, image, port); err != nil {
		log.Printf("❌ Failed to create deployment: %v", err)
		return "", fmt.Errorf("failed to create deployment: %v", err)
	}

	// Create service
	if err := k.CreateService(appName, port); err != nil {
		log.Printf("❌ Failed to create service: %v", err)
		return "", fmt.Errorf("failed to create service: %v", err)
	}

	// Create ingress - use port 80 for ingress
	if err := k.CreateIngress(appName, fullHost, 8080); err != nil {
		log.Printf("❌ Failed to create ingress: %v", err)
		return "", fmt.Errorf("failed to create ingress: %v", err)
	}

	log.Printf("⏳ Waiting for deployment to become ready...")
	if err := k.waitForDeploymentReady(appName); err != nil {
		log.Printf("❌ Deployment failed to become ready: %v", err)
		return "", fmt.Errorf("deployment not ready: %v", err)
	}

	log.Printf("✅ Deployment successful: %s -> %s", appName, fullHost)
	return fullHost, nil
}

func (k *K8sManagerRuntime) cleanupExistingResources(appName string) error {
	// Delete existing deployment
	err := k.clientset.AppsV1().Deployments(k.namespace).Delete(context.TODO(), appName, metav1.DeleteOptions{})
	if err != nil && !errors.IsNotFound(err) {
		log.Printf("⚠️ Failed to delete existing deployment: %v", err)
	}

	// Delete existing service
	err = k.clientset.CoreV1().Services(k.namespace).Delete(context.TODO(), appName, metav1.DeleteOptions{})
	if err != nil && !errors.IsNotFound(err) {
		log.Printf("⚠️ Failed to delete existing service: %v", err)
	}

	// Delete existing ingress
	err = k.clientset.NetworkingV1().Ingresses(k.namespace).Delete(context.TODO(), appName, metav1.DeleteOptions{})
	if err != nil && !errors.IsNotFound(err) {
		log.Printf("⚠️ Failed to delete existing ingress: %v", err)
	}

	// Wait a bit for resources to be cleaned up
	time.Sleep(3 * time.Second)
	return nil
}

func (k *K8sManagerRuntime) waitForDeploymentReady(appName string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	return wait.PollUntilContextTimeout(ctx, 5*time.Second, 10*time.Minute, false,
		func(ctx context.Context) (bool, error) {
			deployment, err := k.clientset.AppsV1().Deployments(k.namespace).Get(ctx, appName, metav1.GetOptions{})
			if err != nil {
				if errors.IsNotFound(err) {
					log.Printf("⏳ Deployment %s not found yet, waiting...", appName)
					return false, nil
				}
				return false, fmt.Errorf("failed to get deployment: %v", err)
			}

			// Log deployment conditions for debugging
			if len(deployment.Status.Conditions) > 0 {
				for _, condition := range deployment.Status.Conditions {
					log.Printf("   📋 Condition: %s=%s - %s", condition.Type, condition.Status, condition.Message)
				}
			}

			// Check if deployment is ready (has available replicas)
			if deployment.Status.AvailableReplicas >= 1 {
				log.Printf("✅ Deployment %s is ready with %d available pods",
					appName, deployment.Status.AvailableReplicas)
				return true, nil
			}

			// Log detailed status for debugging
			log.Printf("⏳ Deployment status: %d/%d replicas available, %d unavailable",
				deployment.Status.AvailableReplicas,
				deployment.Status.Replicas,
				deployment.Status.UnavailableReplicas)

			// Check pod status if deployment is having issues
			if deployment.Status.UnavailableReplicas > 0 {
				k.logPodStatusForDeployment(appName)
			}

			return false, nil
		})
}

func (k *K8sManagerRuntime) logPodStatusForDeployment(appName string) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	pods, err := k.clientset.CoreV1().Pods(k.namespace).List(ctx, metav1.ListOptions{
		LabelSelector: fmt.Sprintf("app=%s", appName),
	})
	if err != nil {
		log.Printf("⚠️ Failed to get pods for deployment %s: %v", appName, err)
		return
	}

	for _, pod := range pods.Items {
		log.Printf("   📦 Pod: %s, Status: %s", pod.Name, pod.Status.Phase)
		for _, containerStatus := range pod.Status.ContainerStatuses {
			if containerStatus.State.Waiting != nil {
				log.Printf("      🐳 Container %s: %s - %s",
					containerStatus.Name,
					containerStatus.State.Waiting.Reason,
					containerStatus.State.Waiting.Message)
			}
		}
	}
}
