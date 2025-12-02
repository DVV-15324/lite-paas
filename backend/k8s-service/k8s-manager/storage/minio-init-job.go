// minio_setup_job.go
package k8smanager

import (
	"context"
	"fmt"
	"log"
	"time"

	batchv1 "k8s.io/api/batch/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (k *K8sManagerStorage) CreateMinioSetupJob(appName, password string) error {
	jobName := fmt.Sprintf("%s-minio-setup", appName)

	// Tạo Job để setup MinIO buckets
	job := &batchv1.Job{
		ObjectMeta: metav1.ObjectMeta{
			Name:      jobName,
			Namespace: k.namespace,
			Labels: map[string]string{
				"app":  appName,
				"type": "minio-setup",
			},
		},
		Spec: batchv1.JobSpec{
			TTLSecondsAfterFinished: int32Ptr(300), // 5 minutes
			BackoffLimit:            int32Ptr(3),
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					RestartPolicy: corev1.RestartPolicyOnFailure,
					Containers: []corev1.Container{
						{
							Name:    "mc-setup",
							Image:   "minio/mc:latest",
							Command: []string{"/bin/sh", "-c"},
							Args: []string{
								fmt.Sprintf(`
								echo "Setting up MinIO buckets for %s..."
								
								# Wait for MinIO to be ready
								until mc alias set myminio http://%s:9000 minioadmin %s; do
									echo "Waiting for MinIO to be ready..."
									sleep 5
								done
								
								echo "MinIO is ready! Creating buckets..."
								
								# Create buckets
								mc mb myminio/uploads --ignore-existing || true
								mc mb myminio/downloads --ignore-existing || true
								mc mb myminio/public --ignore-existing || true
								
								# SỬA QUAN TRỌNG: Set policy đúng cách
								echo "Setting public access policies..."
								mc policy set public myminio/public || true
								
								
								# Alternative: Dùng anonymous commands
								mc anonymous set public myminio/public || true
								
								# Verify policies
								echo "Bucket policies:"
								mc policy list myminio/public
								mc policy list myminio/downloads
								mc policy list myminio/uploads
								
								echo "MinIO setup completed successfully!"
							`, appName, appName, password),
							},
						},
					},
				},
			},
		},
	}

	// Xóa Job cũ nếu tồn tại
	_ = k.clientset.BatchV1().Jobs(k.namespace).Delete(context.TODO(), jobName, metav1.DeleteOptions{})
	time.Sleep(2 * time.Second)

	// Tạo Job mới
	_, err := k.clientset.BatchV1().Jobs(k.namespace).Create(context.TODO(), job, metav1.CreateOptions{})
	if err != nil {
		return fmt.Errorf("failed to create MinIO setup job: %v", err)
	}

	log.Printf("MinIO setup job created: %s", jobName)
	return nil
}
