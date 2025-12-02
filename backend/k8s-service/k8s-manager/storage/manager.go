package k8smanager

import (
	"k8s.io/client-go/kubernetes"
	connect "lite-paas/k8s-service/connect"
)

type ResponseResultDeploy struct {
	PortOne       int64
	PortTwo       int64
	DomainTCP     string
	NameLogin     string
	PassWordLogin string
}

type K8sManagerStorage struct {
	clientset *kubernetes.Clientset
	namespace string
}

func NewK8sManager(namespace, kubeconfigPath string) (*K8sManagerStorage, error) {
	var clientset *kubernetes.Clientset
	var err error

	if kubeconfigPath != "" {
		clientset, err = connect.ConnectRemoteK8s(kubeconfigPath)
	} else {
		clientset, err = connect.ConnectToK8s()
	}
	if err != nil {
		return nil, err
	}

	return &K8sManagerStorage{
		clientset: clientset,
		namespace: namespace,
	}, nil
}
