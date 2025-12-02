package k8smanager

import (
	"fmt"
	"log"
	"time"
)

func DeployDB(appName string, namespace string, dbType string, password string, nodePortOne int32, nodePortTwo int32) {
	log.Printf("Starting database deployment: %s (%s)", appName, dbType)

	k8s, err := NewK8sManager(namespace, "./k8s-service/config.yaml")
	if err != nil {
		log.Printf("Failed to connect to Kubernetes: %v", err)
		return
	}

	if err := k8s.EnsureNamespace(); err != nil {
		log.Printf("Namespace error: %v", err)
		return
	}

	port := getDatabasePort(dbType)
	image := getDatabaseImage(dbType)

	k8s.DeployDatabaseDirect(appName, image, port, dbType, password, nodePortOne, nodePortTwo)

}

// deploy_db.go - Sửa cho MinIO
func (k *K8sManagerStorage) DeployDatabaseDirect(appName, image string, port int, dbType, password string, nodePortOne int32, nodePortTwo int32) {
	log.Printf("Deploying database directly: %s", appName)

	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("PANIC in DeployDatabaseDirect: %v", r)
			}
		}()

		// 1. Tạo folder cho user
		if err := k.CreateFolderJob(appName); err != nil {
			log.Printf("Folder creation warning: %v", err)
		}

		// 2. Xử lý riêng cho MinIO (có 2 ports)
		if dbType == "minio" {
			_, _, _, err := k.DeployMinio(appName, image, password, nodePortOne, nodePortTwo)
			if err != nil {
				log.Printf("MinIO deployment failed: %v", err)
				return
			}

			// Tạo setup job sau khi MinIO chạy
			time.Sleep(30 * time.Second) // Đợi MinIO khởi động
			if err := k.CreateMinioSetupJob(appName, password); err != nil {
				log.Printf("MinIO setup job creation failed: %v", err)
			}
			return
		}

		// 3. Các database khác (giữ nguyên)
		host, nodePort, err := k.DeployDatabase(appName, image, port, nodePortOne, dbType, password)

		if err != nil {
			log.Printf("Database deployment failed: %v", err)
			return
		}

		log.Printf("Database deployment completed: %s:%d", host, nodePort)
	}()
}

func (k *K8sManagerStorage) DeployDatabase(appName, image string, port int, nodePort int32, dbType, password string) (string, int32, error) {
	log.Printf("Deploying database with PV: %s", appName)

	// 1. Tạo deployment với PV
	if err := k.CreateDeploymentWithPV(appName, image, int32(port), dbType, password); err != nil {
		return "", 0, fmt.Errorf("deployment failed: %v", err)
	}

	// 2. Tạo service
	nodePort, err := k.CreateDatabaseService(appName, int32(port), int32(nodePort))
	if err != nil {
		return "", 0, fmt.Errorf("service failed: %v", err)
	}

	// 3. Wait for ready
	if err := k.waitForDeploymentReady(appName); err != nil {
		return "", 0, fmt.Errorf("not ready: %v", err)
	}

	// 4. Get node IP
	nodeIP, err := k.GetNodeIP()
	if err != nil {
		nodeIP = "192.168.5.202"
	}

	return nodeIP, nodePort, nil
}

func (k *K8sManagerStorage) DeployMinio(appName, image, password string, nodePortOne int32, nodePortTwo int32) (string, int32, int32, error) {
	log.Printf("Deploying MinIO with 2 ports: %s", appName)

	// 1. Tạo deployment với PV
	if err := k.CreateDeploymentWithPV(appName, image, 9000, "minio", password); err != nil {
		return "", 0, 0, fmt.Errorf("deployment failed: %v", err)
	}

	// 2. Tạo service với 2 ports
	apiNodePort, consoleNodePort, err := k.CreateMinioService(appName, nodePortOne, nodePortTwo)
	if err != nil {
		return "", 0, 0, fmt.Errorf("service failed: %v", err)
	}

	// 3. Wait for ready
	if err := k.waitForDeploymentReady(appName); err != nil {
		return "", 0, 0, fmt.Errorf("not ready: %v", err)
	}

	// 4. Get node IP
	nodeIP := "192.168.5.202"

	log.Printf("MinIO deployed: %s (API: %d, Console: %d)", nodeIP, apiNodePort, consoleNodePort)
	return nodeIP, apiNodePort, consoleNodePort, nil
}
