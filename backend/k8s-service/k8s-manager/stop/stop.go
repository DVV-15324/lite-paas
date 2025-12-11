package metrics

import (
	"context"
	"fmt"
	corev1 "k8s.io/api/core/v1"
	//"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"time"
)

// ConnectRemoteK8s kết nối Kubernetes từ xa
func ConnectRemoteK8s(kubeconfigPath string) (*kubernetes.Clientset, *rest.Config, error) {
	config, err := clientcmd.BuildConfigFromFlags("", kubeconfigPath)
	if err != nil {
		return nil, nil, fmt.Errorf("build config: %w", err)
	}
	config.TLSClientConfig.Insecure = true
	// Xóa CA
	config.TLSClientConfig.CAFile = ""
	config.TLSClientConfig.CAData = nil
	clientset, err := kubernetes.NewForConfig(config)

	if err != nil {
		return nil, nil, fmt.Errorf("create clientset: %w", err)
	}
	return clientset, config, nil
}

// ConnectToK8s kết nối từ trong cluster
func ConnectToK8s() (*kubernetes.Clientset, *rest.Config, error) {
	config, err := rest.InClusterConfig()
	if err != nil {
		return nil, nil, fmt.Errorf("in-cluster config: %w", err)
	}
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, nil, fmt.Errorf("create clientset: %w", err)
	}
	return clientset, config, nil
}

// DeploymentManager quản lý deployment
type DeploymentManager struct {
	clientset *kubernetes.Clientset
	config    *rest.Config
}

// NewDeploymentManager tạo mới DeploymentManager
func NewDeploymentManager(kubeconfigPath string) (*DeploymentManager, error) {
	var clientset *kubernetes.Clientset
	var config *rest.Config
	var err error

	if kubeconfigPath != "" {
		clientset, config, err = ConnectRemoteK8s(kubeconfigPath)
	} else {
		clientset, config, err = ConnectToK8s()
	}
	if err != nil {
		return nil, fmt.Errorf("connect kubernetes: %w", err)
	}
	return &DeploymentManager{clientset: clientset, config: config}, nil
}

// StartDeployment nếu replica=0 thì scale lên 1
func (dm *DeploymentManager) StartDeployment(namespace, deploymentName string) error {
	ctx := context.Background()

	// Lấy deployment hiện tại
	deployment, err := dm.clientset.AppsV1().Deployments(namespace).Get(ctx, deploymentName, metav1.GetOptions{})
	if err != nil {
		return fmt.Errorf("get deployment: %w", err)
	}

	// Nếu đã có replicas > 0, không làm gì
	if *deployment.Spec.Replicas > 0 {
		return fmt.Errorf("deployment already running with %d replicas", *deployment.Spec.Replicas)
	}

	// Scale lên 1
	patch := []byte(`{"spec":{"replicas":1}}`)
	_, err = dm.clientset.AppsV1().Deployments(namespace).Patch(
		ctx,
		deploymentName,
		types.StrategicMergePatchType,
		patch,
		metav1.PatchOptions{},
	)

	if err != nil {
		return fmt.Errorf("scale to 1: %w", err)
	}

	return nil
}
func (dm *DeploymentManager) StopDeploymentHard(namespace, deploymentName string) error {
	fmt.Printf("[DEBUG] StopDeploymentHard called for %s/%s\n", namespace, deploymentName)
	ctx := context.Background()

	// 1️⃣ Get current deployment
	fmt.Printf("[DEBUG] Getting deployment %s/%s\n", namespace, deploymentName)
	deployment, err := dm.clientset.AppsV1().Deployments(namespace).Get(ctx, deploymentName, metav1.GetOptions{})
	if err != nil {
		fmt.Printf("[ERROR] Failed to get deployment: %v\n", err)
		return fmt.Errorf("get deployment: %w", err)
	}
	fmt.Printf("[DEBUG] Got deployment. Replicas: %d\n", *deployment.Spec.Replicas)

	// 2️⃣ Scale Deployment to 0
	if *deployment.Spec.Replicas != 0 {
		fmt.Printf("[DEBUG] Scaling deployment from %d to 0\n", *deployment.Spec.Replicas)
		zero := int32(0)
		deployment.Spec.Replicas = &zero
		_, err = dm.clientset.AppsV1().Deployments(namespace).Update(ctx, deployment, metav1.UpdateOptions{})
		if err != nil {
			fmt.Printf("[ERROR] Failed to scale deployment: %v\n", err)
			return fmt.Errorf("scale deployment to 0: %w", err)
		}
		fmt.Printf("[DEBUG] Deployment scaled to 0 successfully\n")
	} else {
		fmt.Printf("[DEBUG] Deployment already at 0 replicas\n")
	}

	// 3️⃣ Update related HPAs
	fmt.Printf("[DEBUG] Looking for HPAs targeting this deployment\n")
	hpaList, err := dm.clientset.AutoscalingV2().HorizontalPodAutoscalers(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		fmt.Printf("[WARN] Failed to list HPAs: %v\n", err)
	} else {
		fmt.Printf("[DEBUG] Found %d HPAs in namespace\n", len(hpaList.Items))
		for _, hpa := range hpaList.Items {
			fmt.Printf("[DEBUG] Checking HPA %s (target: %s/%s)\n", hpa.Name, hpa.Spec.ScaleTargetRef.Kind, hpa.Spec.ScaleTargetRef.Name)
			if hpa.Spec.ScaleTargetRef.Kind == "Deployment" && hpa.Spec.ScaleTargetRef.Name == deploymentName {
				fmt.Printf("[DEBUG] Found matching HPA: %s\n", hpa.Name)
				zero := int32(0)
				hpa.Spec.MinReplicas = &zero
				hpa.Spec.MaxReplicas = zero
				_, err := dm.clientset.AutoscalingV2().HorizontalPodAutoscalers(namespace).Update(ctx, &hpa, metav1.UpdateOptions{})
				if err != nil {
					fmt.Printf("[WARN] Failed to update HPA %s: %v\n", hpa.Name, err)
				} else {
					fmt.Printf("[DEBUG] HPA %s updated successfully\n", hpa.Name)
				}
			}
		}
	}

	// 4️⃣ Wait for Pod termination
	fmt.Printf("[DEBUG] Starting pod termination wait loop\n")
	timeout := time.After(60 * time.Second)
	tick := time.NewTicker(2 * time.Second)
	defer tick.Stop()

	selector, err := metav1.LabelSelectorAsSelector(deployment.Spec.Selector)
	if err != nil {
		fmt.Printf("[ERROR] Failed to create selector: %v\n", err)
		return fmt.Errorf("create selector: %w", err)
	}

	for {
		select {
		case <-timeout:
			fmt.Printf("[ERROR] Timeout waiting for pods to terminate\n")
			return fmt.Errorf("timeout waiting for pods to terminate")
		case <-tick.C:
			pods, err := dm.clientset.CoreV1().Pods(namespace).List(ctx, metav1.ListOptions{
				LabelSelector: selector.String(),
			})
			if err != nil {
				fmt.Printf("[ERROR] Failed to list pods: %v\n", err)
				return fmt.Errorf("list pods: %w", err)
			}

			runningPods := 0
			for _, pod := range pods.Items {
				fmt.Printf("[DEBUG] Pod %s status: %s\n", pod.Name, pod.Status.Phase)
				if pod.Status.Phase != corev1.PodSucceeded && pod.Status.Phase != corev1.PodFailed {
					runningPods++
				}
			}

			fmt.Printf("[DEBUG] Found %d pods total, %d still running\n", len(pods.Items), runningPods)

			if runningPods == 0 {
				fmt.Printf("[DEBUG] All pods terminated successfully\n")
				return nil
			}
		}
	}
}
