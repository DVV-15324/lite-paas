package runtime

import (
	"context"
	"fmt"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// CreatePod tạo một Pod mới trong namespace đã cấu hình
func (k *K8sManagerRuntime) CreatePod(appName, image string, port int32, memoryLimit int, cpuLimit float64) error {
	deployMemory := fmt.Sprintf("%dMi", memoryLimit)
	deployCpu := fmt.Sprintf("%dm", int(cpuLimit*1000))
	pod := &corev1.Pod{

		ObjectMeta: metav1.ObjectMeta{
			Name:      appName,
			Namespace: k.namespace,
			Labels: map[string]string{
				"app": appName,
			},
		},
		Spec: corev1.PodSpec{
			NodeName: "node-two",
			Containers: []corev1.Container{
				{
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
				},
			},
			RestartPolicy: corev1.RestartPolicyNever, // Pod không restart tự động
		},
	}

	createdPod, err := k.clientset.CoreV1().Pods(k.namespace).Create(context.TODO(), pod, metav1.CreateOptions{})
	if err != nil {
		return fmt.Errorf("failed to create pod %s: %w", appName, err)
	}

	fmt.Printf("Pod %s created in namespace %s\n", createdPod.Name, k.namespace)
	return nil
}
