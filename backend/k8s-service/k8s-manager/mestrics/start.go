package metrics

// import (
// 	"fmt"
// 	"log"
// )

// // Hàm Deloy sửa lại
// func Deloy() {
// 	// Sửa lại chỉ truyền kubeconfigPath
// 	metricsManager, err := NewK8sManagerMetrics("./k8s-service/config.yaml")
// 	if err != nil {
// 		log.Printf("Failed to connect to Kubernetes: %v", err)
// 		return
// 	}

// 	log.Println("Kết nối Kubernetes thành công!")

// 	// Cách 2: Lấy full metrics (có thể có storage)
// 	fullMetrics, err := metricsManager.GetPodFullMetrics("dinh-vu-dkifogt68jtx", "db", "minio")
// 	if err != nil {
// 		fmt.Printf("Lỗi: %v\n", err)
// 	} else {
// 		fmt.Printf("Full Metrics: %+v\n", fullMetrics)
// 	}
// }
