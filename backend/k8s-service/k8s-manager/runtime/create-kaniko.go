package runtime

import (
	"context"
	"fmt"
	"time"

	batchv1 "k8s.io/api/batch/v1"
	corev1 "k8s.io/api/core/v1"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (k *K8sManagerRuntime) CreateKanikoJob(appName, repoName, gitNameUser, token string, fileDocker string) error {
	imageName := fmt.Sprintf("192.168.5.202:30000/%s:latest", appName)
	jobName := fmt.Sprintf("kaniko-build-%s", appName)
	ttl := int32(60)

	job := &batchv1.Job{
		ObjectMeta: metav1.ObjectMeta{
			Name:      jobName,
			Namespace: k.namespace,
			Labels:    map[string]string{"app": appName},
		},
		Spec: batchv1.JobSpec{
			TTLSecondsAfterFinished: &ttl,
			BackoffLimit:            new(int32),
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{"app": appName, "job": "kaniko"},
				},
				Spec: corev1.PodSpec{
					RestartPolicy: corev1.RestartPolicyNever,
					InitContainers: []corev1.Container{
						{
							Name:    "git-clone",
							Image:   "192.168.5.202:30000/alpine/git:latest",
							Command: []string{"/bin/sh", "-c"},
							Args: []string{
								fmt.Sprintf(
									"git clone https://%s:%s@github.com/%s/%s.git /workspace && cd /workspace && echo '%s' > Dockerfile",
									gitNameUser, token, gitNameUser, repoName, fileDocker,
								),
							},
							VolumeMounts: []corev1.VolumeMount{
								{
									Name:      "workspace",
									MountPath: "/workspace",
								},
							},
						},
					},
					Containers: []corev1.Container{
						{
							Name:  "kaniko",
							Image: "192.168.5.202:30000/kaniko-project/executor:latest",
							Args: []string{
								"--dockerfile=/workspace/Dockerfile",
								"--context=dir:///workspace",
								fmt.Sprintf("--destination=%s", imageName),
								"--insecure",
								"--skip-tls-verify",
								"--skip-tls-verify-pull",
								"--single-snapshot",
								"--cache=false",
								"--force",
								"--cleanup",
								"--no-push-cache",
								"--verbosity=info",
							},
							VolumeMounts: []corev1.VolumeMount{
								{
									Name:      "workspace",
									MountPath: "/workspace",
								},
								{
									Name:      "kaniko-cache",
									MountPath: "/cache",
								},
								{
									Name:      "kaniko-docker",
									MountPath: "/kaniko/.docker",
								},
							},
							Env: []corev1.EnvVar{
								{
									Name:  "DOCKER_CONFIG",
									Value: "/kaniko/.docker",
								},
							},
						},
					},
					Volumes: []corev1.Volume{
						{
							Name: "workspace",
							VolumeSource: corev1.VolumeSource{
								EmptyDir: &corev1.EmptyDirVolumeSource{},
							},
						},
						{
							Name: "kaniko-cache",
							VolumeSource: corev1.VolumeSource{
								EmptyDir: &corev1.EmptyDirVolumeSource{},
							},
						},
						{
							Name: "kaniko-docker",
							VolumeSource: corev1.VolumeSource{
								EmptyDir: &corev1.EmptyDirVolumeSource{},
							},
						},
					},
				},
			},
		},
	}

	// Xóa Job cũ nếu tồn tại
	_ = k.clientset.BatchV1().Jobs(k.namespace).Delete(context.TODO(), jobName, metav1.DeleteOptions{})
	time.Sleep(3 * time.Second)

	_, err := k.clientset.BatchV1().Jobs(k.namespace).Create(context.TODO(), job, metav1.CreateOptions{})
	if err != nil {
		return fmt.Errorf("failed to create kaniko job: %v", err)
	}

	return nil
}
