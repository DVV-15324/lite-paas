package connect

import (
	"fmt"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

func ConnectRemoteK8s(kubeconfigPath string) (*kubernetes.Clientset, error) {
	config, err := clientcmd.BuildConfigFromFlags("", kubeconfigPath)
	if err != nil {
		return nil, fmt.Errorf("cannot build kubeconfig: %w", err)
	}

	config.TLSClientConfig.Insecure = true
	// Xóa CA
	config.TLSClientConfig.CAFile = ""
	config.TLSClientConfig.CAData = nil
	if err != nil {
		return nil, fmt.Errorf("failed to build kubeconfig: %v", err)
	}
	return kubernetes.NewForConfig(config)
}
