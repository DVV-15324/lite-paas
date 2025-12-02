package runtime

import (
	"context"
	"fmt"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (k *K8sManagerRuntime) EnsureNamespace() error {
	_, err := k.clientset.CoreV1().Namespaces().Get(context.TODO(), k.namespace, metav1.GetOptions{})
	if err == nil {
		return nil
	}

	fmt.Printf("Error getting namespace '%s': %v\n", k.namespace, err)

	if errors.IsNotFound(err) {
		namespace := &corev1.Namespace{
			ObjectMeta: metav1.ObjectMeta{
				Name: k.namespace,
				Labels: map[string]string{
					"name": k.namespace,
					"env":  "auto-deploy",
				},
			},
		}
		_, err = k.clientset.CoreV1().Namespaces().Create(context.TODO(), namespace, metav1.CreateOptions{})
		if err != nil {
			return fmt.Errorf("failed to create namespace: %v", err)
		}
		fmt.Printf("Namespace '%s' created successfully\n", k.namespace)
		return nil
	}

	return fmt.Errorf("failed to check namespace: %v", err)
}
