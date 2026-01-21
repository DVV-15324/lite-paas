package k8smanager

import (
	"k8s.io/client-go/kubernetes"
	connect "lite-paas/infrastructure/k8s/connect"
)

type K8sManagerStorage struct {
	clientset *kubernetes.Clientset
	namespace string
}

func NewK8sManager(namespace, kubeconfigPath string) (*K8sManagerStorage, error) {
	var clientset *kubernetes.Clientset
	var err error

	if kubeconfigPath != "" {
		clientset, err = connect.ConnectRemoteK8s(kubeconfigPath)
	}
	if err != nil {
		return nil, err
	}

	return &K8sManagerStorage{
		clientset: clientset,
		namespace: namespace,
	}, nil
}
