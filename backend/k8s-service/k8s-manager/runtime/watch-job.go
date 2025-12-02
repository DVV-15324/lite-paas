package runtime

// import (
// 	broadcastMessage "lite-paas/common/hub"
// 	"context"
// 	"fmt"
// 	"k8s.io/apimachinery/pkg/api/errors"
// 	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
// 	"k8s.io/apimachinery/pkg/util/wait"
// 	"log"
// 	"time"
// )

// func (k *K8sManager) WatchJob(appName string, user string, serviceId string, baseDomain string) {
// 	jobName := fmt.Sprintf("kaniko-build-%s", appName)
// 	log.Printf("Watching job: %s", jobName)

// 	err := wait.PollUntilContextTimeout(context.Background(), 5*time.Second, 10*time.Minute, false,
// 		func(ctx context.Context) (bool, error) {
// 			job, err := k.clientset.BatchV1().Jobs(k.namespace).Get(ctx, jobName, metav1.GetOptions{})
// 			if err != nil {
// 				if errors.IsNotFound(err) {
// 					return false, nil
// 				}
// 				return false, err
// 			}

// 			// Khi job build thành công
// 			if job.Status.Succeeded > 0 {
// 				log.Printf("Build completed: %s", job.Name)

// 				image := fmt.Sprintf("192.168.5.200:32000/%s:latest", appName)

// 				// Triển khai app với image vừa build xong
// 				host, err := k.DeployApp(appName, image, baseDomain, 8080)
// 				if err == nil {
// 					data := broadcastMessage.BroadcastMessage{
// 						ServiceId: serviceId,
// 						Data: []byte(fmt.Sprintf(
// 							`{"app":"%s","status":"active","host":"%s"}`, appName, host)),
// 					}
// 					k.hub.Broadcast <- data

// 					// Chờ pod app chạy rồi stream log với retry mechanism
// 					go k.waitAndStreamAppLogs(appName, serviceId)
// 				} else {
// 					log.Printf("App deployment failed: %v", err)
// 					data := broadcastMessage.BroadcastMessage{
// 						ServiceId: serviceId,
// 						Data:      []byte(fmt.Sprintf(`{"app":"%s","status":"failed"}`, appName)),
// 					}
// 					k.hub.Broadcast <- data
// 				}

// 				// Xóa job sau khi hoàn tất build
// 				deletePolicy := metav1.DeletePropagationBackground
// 				err = k.clientset.BatchV1().Jobs(k.namespace).Delete(ctx, jobName, metav1.DeleteOptions{
// 					PropagationPolicy: &deletePolicy,
// 				})
// 				if err != nil {
// 					log.Printf("Failed to delete job %s: %v", jobName, err)
// 				} else {
// 					log.Printf("Job %s deleted after success", jobName)
// 				}

// 				return true, nil
// 			}

// 			// In trạng thái Job
// 			log.Printf("Job %s status: Succeeded=%d, Failed=%d",
// 				jobName, job.Status.Succeeded, job.Status.Failed)
// 			return false, nil
// 		})

// 	if err != nil {
// 		log.Printf("Watch error: %v", err)
// 	}
// }
