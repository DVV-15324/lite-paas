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

func (k *K8sManagerStorage) CreateDeploymentWithPV(appName, image string, port int32, dbType, password string) error {

	// Tạo PV/PVC trước
	storageSize := getDatabaseStorageSize(dbType)
	if err := k.CreateDatabasePVPVC(appName, storageSize); err != nil {
		return fmt.Errorf("failed to create PV/PVC: %v", err)
	}

	var envVars []corev1.EnvVar
	var volumeMounts []corev1.VolumeMount
	var commands []string
	var args []string
	var containerPorts []corev1.ContainerPort

	// Cấu hình database-specific
	switch dbType {
	case "mssql":
		envVars = []corev1.EnvVar{
			{Name: "ACCEPT_EULA", Value: "Y"},
			{Name: "SA_PASSWORD", Value: password},
			{Name: "MSSQL_PID", Value: "Express"},
		}
		volumeMounts = []corev1.VolumeMount{
			{Name: "database-data", MountPath: "/var/opt/mssql"},
		}
		containerPorts = []corev1.ContainerPort{{ContainerPort: port}}

	case "mysql":
		envVars = []corev1.EnvVar{
			{Name: "MYSQL_ROOT_PASSWORD", Value: password},
			{Name: "MYSQL_DATABASE", Value: appName},
		}
		volumeMounts = []corev1.VolumeMount{
			{Name: "database-data", MountPath: "/var/lib/mysql"},
		}
		containerPorts = []corev1.ContainerPort{{ContainerPort: port}}

	case "mongodb":
		envVars = []corev1.EnvVar{
			{Name: "MONGO_INITDB_ROOT_USERNAME", Value: "root"},
			{Name: "MONGO_INITDB_ROOT_PASSWORD", Value: password},
		}
		volumeMounts = []corev1.VolumeMount{
			{Name: "database-data", MountPath: "/data/db"},
		}
		containerPorts = []corev1.ContainerPort{{ContainerPort: port}}

	case "minio":
		envVars = []corev1.EnvVar{
			{Name: "MINIO_ROOT_USER", Value: "minioadmin"},
			{Name: "MINIO_ROOT_PASSWORD", Value: password},
		}
		volumeMounts = []corev1.VolumeMount{
			{Name: "database-data", MountPath: "/data"},
		}
		// SỬA QUAN TRỌNG: MinIO cần 2 ports
		containerPorts = []corev1.ContainerPort{
			{Name: "api", ContainerPort: 9000},
			{Name: "console", ContainerPort: 9001},
		}
		args = []string{"server", "/data", "--console-address", ":9001"}

	case "postgresql":
		envVars = []corev1.EnvVar{
			{Name: "POSTGRES_DB", Value: appName},
			{Name: "POSTGRES_USER", Value: "postgres"},
			{Name: "POSTGRES_PASSWORD", Value: password},
		}
		volumeMounts = []corev1.VolumeMount{
			{Name: "database-data", MountPath: "/var/lib/postgresql/data"},
		}
		containerPorts = []corev1.ContainerPort{{ContainerPort: port}}

	case "redis":
		envVars = []corev1.EnvVar{
			{Name: "REDIS_PASSWORD", Value: password},
		}
		commands = []string{"redis-server", "--requirepass", password}
		volumeMounts = []corev1.VolumeMount{
			{Name: "database-data", MountPath: "/data"},
		}
		containerPorts = []corev1.ContainerPort{{ContainerPort: port}}
	}

	container := corev1.Container{
		Name:         "database",
		Image:        image,
		Ports:        containerPorts,
		Env:          envVars,
		VolumeMounts: volumeMounts,
		Resources: corev1.ResourceRequirements{
			Requests: corev1.ResourceList{
				corev1.ResourceMemory: resource.MustParse("256Mi"),
				corev1.ResourceCPU:    resource.MustParse("250m"),
			},
			Limits: corev1.ResourceList{
				corev1.ResourceMemory: resource.MustParse("1Gi"),
				corev1.ResourceCPU:    resource.MustParse("500m"),
			},
		},
	}

	// Thêm command hoặc args nếu có
	if len(commands) > 0 {
		container.Command = commands
	}
	if len(args) > 0 {
		container.Args = args
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
					NodeSelector: map[string]string{
						"kubernetes.io/hostname": "node-two",
					},
					Containers: []corev1.Container{container},
					Volumes: []corev1.Volume{
						{
							Name: "database-data",
							VolumeSource: corev1.VolumeSource{
								PersistentVolumeClaim: &corev1.PersistentVolumeClaimVolumeSource{
									ClaimName: fmt.Sprintf("%s-pvc", appName),
								},
							},
						},
					},
				},
			},
		},
	}

	_, err := k.clientset.AppsV1().Deployments(k.namespace).Create(context.TODO(), deploy, metav1.CreateOptions{})
	if err != nil {
		return err
	}

	return nil
}
