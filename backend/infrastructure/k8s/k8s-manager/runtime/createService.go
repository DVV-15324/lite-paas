package runtime

import (
	"context"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
)

func (k *K8sManagerRuntime) CreateService(appName string, port int32) error {
	svc := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:      appName,
			Namespace: k.namespace,
			Labels: map[string]string{
				"app": appName,
			},
		},
		Spec: corev1.ServiceSpec{
			Selector: map[string]string{"app": appName},
			Ports: []corev1.ServicePort{
				{
					Port:       port,
					TargetPort: intstr.FromInt32(port),
					Protocol:   corev1.ProtocolTCP,
					Name:       "http",
				},
			},
			Type: corev1.ServiceTypeClusterIP,
		},
	}

	_, err := k.clientset.CoreV1().Services(k.namespace).Create(context.TODO(), svc, metav1.CreateOptions{})
	return err
}
