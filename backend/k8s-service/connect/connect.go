package connect

import (
	"fmt"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
	"os"
	"path/filepath"
)

func ConnectToK8s() (*kubernetes.Clientset, error) {

	if config, err := rest.InClusterConfig(); err == nil {
		return kubernetes.NewForConfig(config)
	}

	var kubeconfig string
	if home := homedir.HomeDir(); home != "" {
		kubeconfig = filepath.Join(home, ".kube", "config")
	} else {
		kubeconfig = filepath.Join("/root", ".kube", "config")
	}

	if _, err := os.Stat(kubeconfig); err == nil {
		config, err := clientcmd.BuildConfigFromFlags("", kubeconfig)
		if err != nil {
			return nil, fmt.Errorf("failed to create K8s config: %v", err)
		}
		return kubernetes.NewForConfig(config)
	}

	return nil, fmt.Errorf("could not find any Kubernetes configuration")
}

func ConnectRemoteK8s(kubeconfigPath string) (*kubernetes.Clientset, error) {
	config, err := clientcmd.BuildConfigFromFlags("https://127.0.0.1:6443", kubeconfigPath)

	config.TLSClientConfig.Insecure = true
	// Xóa CA
	config.TLSClientConfig.CAFile = ""
	config.TLSClientConfig.CAData = nil
	if err != nil {
		return nil, fmt.Errorf("failed to build kubeconfig: %v", err)
	}
	return kubernetes.NewForConfig(config)
}
