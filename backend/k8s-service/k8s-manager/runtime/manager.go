package runtime

import (
	"k8s.io/client-go/kubernetes"
	hub "lite-paas/common/hub"
	connect "lite-paas/k8s-service/connect"
)

type K8sManagerRuntime struct {
	clientset  *kubernetes.Clientset
	namespace  string
	baseDomain string
	hub        *hub.ServiceHub
}

func NewK8sManagerRuntime(namespace, baseDomain, kubeconfigPath string, hub *hub.ServiceHub) (*K8sManagerRuntime, error) {
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

	return &K8sManagerRuntime{

		clientset:  clientset,
		namespace:  namespace,
		baseDomain: baseDomain,
		hub:        hub,
	}, nil
}
