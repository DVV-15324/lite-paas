package runtime

import (
	"k8s.io/client-go/kubernetes"
	connect "lite-paas/infrastructure/k8s/connect"
)

type K8sManagerRuntime struct {
	clientset  *kubernetes.Clientset
	namespace  string
	baseDomain string
}

func NewK8sManagerRuntime(namespace, baseDomain, kubeconfigPath string) (*K8sManagerRuntime, error) {
	var clientset *kubernetes.Clientset
	var err error

	if kubeconfigPath != "" {
		clientset, err = connect.ConnectRemoteK8s(kubeconfigPath)
	}
	if err != nil {
		return nil, err
	}

	return &K8sManagerRuntime{

		clientset:  clientset,
		namespace:  namespace,
		baseDomain: baseDomain,
	}, nil
}
