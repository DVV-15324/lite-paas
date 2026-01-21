// database_deployment.go
package k8smanager

import (
	"context"
	"fmt"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (k *K8sManagerStorage) CreateDatabaseDeployment(appName, image string, port int32, password string, memoryLimit int, cpuLimit float32, storageLimit int, envKeys string) error {

	deployMemory := fmt.Sprintf("%dMi", memoryLimit)
	deployCpu := fmt.Sprintf("%dm", int(cpuLimit*1000))
	deployStorage := fmt.Sprintf("%dGi", storageLimit)
	deployImage := fmt.Sprintf("192.168.5.202:30000/%s", image)
	if err := k.CreateDatabasePVPVC(appName, deployStorage); err != nil {
		return fmt.Errorf("failed to create PV/PVC: %v", err)
	}
	envVars := []corev1.EnvVar{
		{Name: envKeys, Value: password},
	}

	container := corev1.Container{
		Name:  appName,
		Image: deployImage,
		Ports: []corev1.ContainerPort{{ContainerPort: port}},
		Env:   envVars,
		Resources: corev1.ResourceRequirements{
			Requests: corev1.ResourceList{
				corev1.ResourceMemory: resource.MustParse("256Mi"),
				corev1.ResourceCPU:    resource.MustParse("250m"),
			},
			Limits: corev1.ResourceList{
				corev1.ResourceMemory: resource.MustParse(deployMemory),
				corev1.ResourceCPU:    resource.MustParse(deployCpu),
			},
		},
	}

	deploy := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      appName,
			Namespace: k.namespace,
			Labels:    map[string]string{"app": appName},
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: int32Ptr(1),
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{"app": appName},
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{"app": appName},
				},
				Spec: corev1.PodSpec{
					NodeName:   "node-two",
					Containers: []corev1.Container{container},
				},
			},
		},
	}

	_, err := k.clientset.AppsV1().Deployments(k.namespace).Create(context.TODO(), deploy, metav1.CreateOptions{})
	if err != nil {
		return fmt.Errorf("failed to create database deployment: %v", err)
	}
	return nil
}
