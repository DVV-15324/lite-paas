// minio_service.go
package k8smanager

import (
	"context"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
)

func (k *K8sManagerStorage) CreateMinioService(appName string, nodePortOne int32, nodePortTwo int32) (int32, int32, error) {
	service := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:      appName,
			Namespace: k.namespace,
			Labels:    map[string]string{"app": appName},
		},
		Spec: corev1.ServiceSpec{
			Selector: map[string]string{"app": appName},
			Ports: []corev1.ServicePort{
				{
					Name:       "api",
					Port:       9000,
					TargetPort: intstr.FromInt(9000),
					NodePort:   nodePortOne, // Let Kubernetes assign
					Protocol:   corev1.ProtocolTCP,
				},
				{
					Name:       "console",
					Port:       9001,
					TargetPort: intstr.FromInt(9001),
					NodePort:   nodePortTwo, // Let Kubernetes assign
					Protocol:   corev1.ProtocolTCP,
				},
			},
			Type: corev1.ServiceTypeNodePort,
		},
	}

	_, err := k.clientset.CoreV1().Services(k.namespace).Create(context.TODO(), service, metav1.CreateOptions{})
	if err != nil {
		return 0, 0, err
	}

	// Get the created service to find NodePorts
	createdSvc, err := k.clientset.CoreV1().Services(k.namespace).Get(context.TODO(), appName, metav1.GetOptions{})
	if err != nil {
		return 0, 0, err
	}

	var apiNodePort, consoleNodePort int32
	for _, port := range createdSvc.Spec.Ports {
		if port.Name == "api" {
			apiNodePort = port.NodePort
		} else if port.Name == "console" {
			consoleNodePort = port.NodePort
		}
	}

	return apiNodePort, consoleNodePort, nil
}
