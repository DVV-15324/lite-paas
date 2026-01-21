package k8smanager

import (
	"context"
	"fmt"

	batchv1 "k8s.io/api/batch/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (k *K8sManagerStorage) CreateFolderJob(AppName string) error {
	jobName := fmt.Sprintf("create-folder-%s", AppName)

	job := &batchv1.Job{
		ObjectMeta: metav1.ObjectMeta{
			Name:      jobName,
			Namespace: k.namespace,
		},
		Spec: batchv1.JobSpec{
			TTLSecondsAfterFinished: int32Ptr(0),
			Template: corev1.PodTemplateSpec{
				Spec: corev1.PodSpec{
					NodeName:      "node-one",
					RestartPolicy: corev1.RestartPolicyNever,
					Containers: []corev1.Container{
						{
							Name:    "create-folder",
							Image:   "192.168.5.202:30000/alpine:3.20",
							Command: []string{"/bin/sh", "-c"},
							Args: []string{
								fmt.Sprintf(`
									mkdir -p /data/databases/%s &&
									chmod 755 /data/databases/%s &&
									echo "Folder created successfully for %s"
								`, AppName, AppName, AppName),
							},
							VolumeMounts: []corev1.VolumeMount{
								{
									Name:      "databases-data",
									MountPath: "/data/databases",
								},
							},
						},
					},
					Volumes: []corev1.Volume{
						{
							Name: "databases-data",
							VolumeSource: corev1.VolumeSource{
								HostPath: &corev1.HostPathVolumeSource{
									Path: "/data/databases",
									Type: &hostPathDirectoryOrCreate,
								},
							},
						},
					},
				},
			},
		},
	}

	// Xóa job cũ nếu còn tồn tại
	_ = k.clientset.BatchV1().Jobs(k.namespace).Delete(context.TODO(), jobName, metav1.DeleteOptions{})

	_, err := k.clientset.BatchV1().Jobs(k.namespace).Create(context.TODO(), job, metav1.CreateOptions{})
	if err != nil {
		return fmt.Errorf("failed to create folder job: %v", err)
	}

	return nil
}
