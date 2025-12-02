package k8smanager

import (
	"lite-paas/k8s-service/templates/docker"
	"log"
)

func K8smanager() {
	log.Println("BẮT ĐẦU DEPLOY DATABASE")

	// CONFIG ĐƠN GIẢN
	dbType := "mssql"    // Đổi thành mysql/mongodb/minio nếu muốn
	appName := "test-db" // Đổi tên nếu muốn
	namespace := "db"

	log.Printf("Database: %s, Tên: %s", dbType, appName)

	// Lấy cấu hình database
	username, password, port, err := docker.ChooseStorage(dbType)
	if err != nil {
		log.Fatalf("Lỗi: %v", err)
	}

	log.Printf("Config: User=%s, Port=%d, Password=%s", username, port, password)

	// DEPLOY!
	DeployDB(appName, namespace,
		dbType, password, 000, 0)

	log.Println("Đang chạy... Chờ hoàn tất.")
	select {} // Giữ chương trình chạy
}

// func K8smanagerMinio() {
// 	log.Println("BẮT ĐẦU DEPLOY MINIO VỚI SETUP JOB")

// 	// CONFIG - TEST MINIO VỚI JOB SETUP
// 	dbType := "minio"
// 	appName := "user-minio-job"
// 	namespace := "db"
// 	password := "minio12345"

// 	log.Printf("Database: %s, Tên: %s", dbType, appName)
// 	log.Printf("MinIO sẽ được setup tự động với Job:")
// 	log.Printf("   - Tạo buckets: uploads, downloads, public")
// 	log.Printf("   - Set public access policies")

// 	// DEPLOY - sẽ tự động tạo setup job!
// 	DeployDB(appName, "minio-service-1", namespace,
// 		dbType, password)

// 	log.Println("Đang deploy MinIO và chạy setup job...")
// 	select {} // Giữ chương trình chạy
// }
