package k8smanager

import (
	"fmt"
	"log"
)

func DeployDB(appName string, namespace string, port int, image string, password string, nodePort int32, memoryLimit int, cpuLimit float32, storageLimit int, envKeys string) {

	k8s, err := NewK8sManager(namespace, "./infrastructure/k8s/config.yaml")
	if err != nil {
		log.Printf("Failed to connect to Kubernetes: %v", err)
		return
	}

	k8s.DeployDatabase(appName, image, port, nodePort, password, memoryLimit, cpuLimit, storageLimit, envKeys)

}

func (k *K8sManagerStorage) DeployDatabase(appName, image string, port int, nodePort int32, password string, memoryLimit int, cpuLimit float32, storageLimit int, envKeys string) (string, int32, error) {
	//fmt.Println(memoryLimit, cpuLimit, storageLimit, envKeys)
	// 1. Tạo deployment với PV
	if err := k.CreateDatabaseDeployment(appName, image, int32(port), password, memoryLimit, cpuLimit, storageLimit, envKeys); err != nil {
		return "", 0, fmt.Errorf("deployment failed: %v", err)
	}
	// 1. Tạo folder cho user
	if err := k.CreateFolderJob(appName); err != nil {
		log.Printf("Folder creation warning: %v", err)
	}

	// 2. Tạo service
	nodePort, err := k.CreateDatabaseService(appName, int32(port), int32(nodePort))
	if err != nil {
		return "", 0, fmt.Errorf("service failed: %v", err)
	}

	// 4. Get node IP
	nodeIP := "192.168.5.202"

	return nodeIP, nodePort, nil
}
