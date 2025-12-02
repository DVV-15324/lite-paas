package k8smanager

import (
	"context"
	"fmt"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (k *K8sManagerStorage) CreateDatabasePVPVC(appName string, storageSize string) error {
	pvName := fmt.Sprintf("%s-pv", appName)
	pvcName := fmt.Sprintf("%s-pvc", appName)

	// Tạo PersistentVolume
	pv := &corev1.PersistentVolume{
		ObjectMeta: metav1.ObjectMeta{
			Name: pvName,
			Labels: map[string]string{
				"app":  appName,
				"type": "database",
			},
		},
		Spec: corev1.PersistentVolumeSpec{
			Capacity: corev1.ResourceList{
				corev1.ResourceStorage: resource.MustParse(storageSize),
			},
			AccessModes: []corev1.PersistentVolumeAccessMode{
				corev1.ReadWriteOnce,
			},
			PersistentVolumeReclaimPolicy: corev1.PersistentVolumeReclaimRetain,
			StorageClassName:              "manual",
			PersistentVolumeSource: corev1.PersistentVolumeSource{
				HostPath: &corev1.HostPathVolumeSource{
					Path: fmt.Sprintf("/data/databases/%s", appName),
					Type: &hostPathDirectoryOrCreate,
				},
			},
			NodeAffinity: &corev1.VolumeNodeAffinity{
				Required: &corev1.NodeSelector{
					NodeSelectorTerms: []corev1.NodeSelectorTerm{
						{
							MatchExpressions: []corev1.NodeSelectorRequirement{
								{
									Key:      "kubernetes.io/hostname",
									Operator: corev1.NodeSelectorOpIn,
									Values:   []string{"node-two"},
								},
							},
						},
					},
				},
			},
		},
	}

	// Tạo PersistentVolumeClaim
	pvc := &corev1.PersistentVolumeClaim{
		ObjectMeta: metav1.ObjectMeta{
			Name:      pvcName,
			Namespace: k.namespace,
			Labels:    map[string]string{"app": appName},
		},
		Spec: corev1.PersistentVolumeClaimSpec{
			AccessModes: []corev1.PersistentVolumeAccessMode{
				corev1.ReadWriteOnce,
			},
			Resources: corev1.VolumeResourceRequirements{
				Requests: corev1.ResourceList{
					corev1.ResourceStorage: resource.MustParse(storageSize),
				},
			},
			StorageClassName: stringPtr("manual"),
			VolumeName:       pvName,
		},
	}

	// Xóa PV/PVC cũ nếu tồn tại
	k.cleanupPVPVC(pvName, pvcName)

	// Tạo PV
	_, err := k.clientset.CoreV1().PersistentVolumes().Create(context.TODO(), pv, metav1.CreateOptions{})
	if err != nil && !errors.IsAlreadyExists(err) {
		return fmt.Errorf("failed to create PV: %v", err)
	}

	// Tạo PVC
	_, err = k.clientset.CoreV1().PersistentVolumeClaims(k.namespace).Create(context.TODO(), pvc, metav1.CreateOptions{})
	if err != nil && !errors.IsAlreadyExists(err) {
		return fmt.Errorf("failed to create PVC: %v", err)
	}
	return nil
}

func (k *K8sManagerStorage) cleanupPVPVC(pvName, pvcName string) {
	// Xóa PVC trước
	_ = k.clientset.CoreV1().PersistentVolumeClaims(k.namespace).Delete(context.TODO(), pvcName, metav1.DeleteOptions{})
	// Xóa PV
	_ = k.clientset.CoreV1().PersistentVolumes().Delete(context.TODO(), pvName, metav1.DeleteOptions{})
}
