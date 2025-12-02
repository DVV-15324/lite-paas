package runtime

import (
	"context"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (k *K8sManagerRuntime) CreateDeployment(appName, image string, port int32) error {
	replicas := int32(1)

	deploy := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      appName,
			Namespace: k.namespace,
			Labels: map[string]string{
				"app": appName,
			},
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: &replicas,
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{"app": appName},
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{"app": appName},
				},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{{
						Name:  "app",
						Image: image,
						Ports: []corev1.ContainerPort{
							{
								ContainerPort: port,
								Name:          "http",
							},
						},
						Env: []corev1.EnvVar{
							{
								Name:  "APP_NAME",
								Value: appName,
							},
						},
					}},
				},
			},
		},
	}

	_, err := k.clientset.AppsV1().Deployments(k.namespace).Create(context.TODO(), deploy, metav1.CreateOptions{})
	return err
}
