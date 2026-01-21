package k8smanager

import (
	"context"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
)

func (k *K8sManagerStorage) CreateDatabaseService(appName string, port int32, nodePort int32) (int32, error) {
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
					Port:       port,
					TargetPort: intstr.FromInt32(port),
					NodePort:   nodePort,
					Protocol:   corev1.ProtocolTCP,
				},
			},
			Type: corev1.ServiceTypeNodePort,
		},
	}

	_, err := k.clientset.CoreV1().Services(k.namespace).Create(context.TODO(), service, metav1.CreateOptions{})
	if err != nil {
		return 0, err
	}

	// Lấy lại service để kiểm tra NodePort
	createdSvc, err := k.clientset.CoreV1().Services(k.namespace).Get(context.TODO(), appName, metav1.GetOptions{})
	if err != nil {
		return 0, err
	}

	if len(createdSvc.Spec.Ports) > 0 {
		return createdSvc.Spec.Ports[0].NodePort, nil
	}

	return 0, nil
}
