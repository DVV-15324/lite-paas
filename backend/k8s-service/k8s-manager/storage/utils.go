package k8smanager

import (
	"context"
	"fmt"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/wait"
	"log"
	"time"
)

// Utility functions
var hostPathDirectoryOrCreate = corev1.HostPathDirectoryOrCreate

func stringPtr(s string) *string {
	return &s
}

func int32Ptr(i int32) *int32 {
	return &i
}

func (k *K8sManagerStorage) EnsureNamespace() error {
	_, err := k.clientset.CoreV1().Namespaces().Get(context.TODO(), k.namespace, metav1.GetOptions{})
	if err == nil {
		return nil
	}

	if errors.IsNotFound(err) {
		namespace := &corev1.Namespace{
			ObjectMeta: metav1.ObjectMeta{
				Name: k.namespace,
			},
		}
		_, err = k.clientset.CoreV1().Namespaces().Create(context.TODO(), namespace, metav1.CreateOptions{})
		if err != nil {
			return fmt.Errorf("failed to create namespace: %v", err)
		}
		log.Printf("Namespace created: %s", k.namespace)
		return nil
	}

	return fmt.Errorf("failed to check namespace: %v", err)
}

func (k *K8sManagerStorage) waitForDeploymentReady(appName string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	log.Printf("Waiting for deployment: %s", appName)

	return wait.PollUntilContextTimeout(ctx, 5*time.Second, 10*time.Minute, false,
		func(ctx context.Context) (bool, error) {
			deployment, err := k.clientset.AppsV1().Deployments(k.namespace).Get(ctx, appName, metav1.GetOptions{})
			if err != nil {
				if errors.IsNotFound(err) {
					return false, nil
				}
				return false, err
			}

			if deployment.Status.AvailableReplicas > 0 {
				log.Printf("Deployment ready: %s", appName)
				return true, nil
			}

			log.Printf("Status - Available: %d", deployment.Status.AvailableReplicas)
			return false, nil
		})
}

// utils.go
func (k *K8sManagerStorage) GetNodeIP() (string, error) {
	nodes, err := k.clientset.CoreV1().Nodes().List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return "", err
	}

	// Tìm node có tên "node-two"
	for _, node := range nodes.Items {
		if node.Name == "node-two" {
			for _, address := range node.Status.Addresses {
				if address.Type == corev1.NodeInternalIP {
					return address.Address, nil
				}
			}
		}
	}

	// Fallback: nếu không tìm thấy node-two, trả về node đầu tiên
	if len(nodes.Items) > 0 {
		for _, address := range nodes.Items[0].Status.Addresses {
			if address.Type == corev1.NodeInternalIP {
				return address.Address, nil
			}
		}
	}

	return "", fmt.Errorf("no node IP found")
}
