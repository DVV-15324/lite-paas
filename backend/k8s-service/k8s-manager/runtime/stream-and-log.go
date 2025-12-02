package runtime

// import (
// 	"context"
// 	"fmt"
// 	"io"
// 	"log"
// 	"strings"

// 	//"io"
// 	broadcastMessage "lite-paas/common/hub"
// 	//k8smanager "lite-paas/k8s-service/k8s-manager"
// 	"time"

// 	corev1 "k8s.io/api/core/v1"

// 	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
// )

// func (k *K8sManager) waitAndStreamAppLogs(appName string, serviceId string) {
// 	log.Printf("Starting continuous log streaming for app: %s", appName)

// 	trackedPods := make(map[string]struct{})

// 	for {
// 		// Lấy tất cả pods của app
// 		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
// 		pods, err := k.clientset.CoreV1().Pods(k.namespace).List(ctx, metav1.ListOptions{
// 			LabelSelector: fmt.Sprintf("app=%s", appName),
// 		})
// 		cancel()

// 		if err != nil {
// 			log.Printf("Error listing pods for %s: %v", appName, err)
// 			time.Sleep(10 * time.Second)
// 			continue
// 		}

// 		for _, pod := range pods.Items {
// 			if pod.Status.Phase != corev1.PodRunning {
// 				continue
// 			}

// 			// Nếu pod chưa được stream log, bắt đầu stream
// 			if _, ok := trackedPods[pod.Name]; !ok {
// 				trackedPods[pod.Name] = struct{}{}
// 				go func(p corev1.Pod) {
// 					ctx, cancel := context.WithCancel(context.Background())
// 					defer cancel()

// 					err := k.streamPodLogs(ctx, p.Name, appName, serviceId)
// 					if err != nil {
// 						log.Printf("Log stream error for pod %s: %v", p.Name, err)
// 					}
// 					// Khi pod chết hoặc stream lỗi → xóa khỏi tracked để retry khi pod restart
// 					delete(trackedPods, p.Name)
// 				}(pod)
// 			}
// 		}

// 		// Sleep trước khi check lại pods
// 		time.Sleep(5 * time.Second)
// 	}
// }

// func (k *K8sManager) getAppPodsWithRetry(ctx context.Context, appName string, maxRetries int) (*corev1.PodList, error) {
// 	var lastErr error
// 	for i := 0; i < maxRetries; i++ {
// 		pods, err := k.clientset.CoreV1().Pods(k.namespace).List(ctx, metav1.ListOptions{
// 			LabelSelector: fmt.Sprintf("app=%s", appName),
// 		})
// 		if err == nil {
// 			return pods, nil
// 		}
// 		lastErr = err
// 		log.Printf("r (retry %d/%d): %v", i+1, maxRetries, err)
// 		time.Sleep(5 * time.Second)
// 	}
// 	return nil, fmt.Errorf("failed after %d retries: %v", maxRetries, lastErr)
// }

// func (k *K8sManager) logPodDetails(pod corev1.Pod) {
// 	log.Printf("   Pod Details:")
// 	log.Printf("   Name: %s", pod.Name)
// 	log.Printf("   Status: %s", pod.Status.Phase)
// 	log.Printf("   Node: %s", pod.Spec.NodeName)

// 	// Log container statuses
// 	for _, cs := range pod.Status.ContainerStatuses {
// 		log.Printf("   Container: %s", cs.Name)
// 		log.Printf("     Ready: %t", cs.Ready)
// 		log.Printf("     Restarts: %d", cs.RestartCount)
// 		if cs.State.Waiting != nil {
// 			log.Printf("     State: Waiting - %s", cs.State.Waiting.Reason)
// 		}
// 		if cs.State.Running != nil {
// 			log.Printf("     State: Running since %s", cs.State.Running.StartedAt.Format("15:04:05"))
// 		}
// 	}

// 	// Log pod conditions
// 	for _, cond := range pod.Status.Conditions {
// 		log.Printf("   Condition: %s=%s (%s)", cond.Type, cond.Status, cond.Message)
// 	}
// }
// func (k *K8sManager) StreamAppLogs(ctx context.Context, appName string, serviceId string) {
// 	log.Printf(" Starting log stream for app: %s", appName)

// 	// Thử lấy pods với retry
// 	pods, err := k.getAppPodsWithRetry(ctx, appName, 5)
// 	if err != nil || len(pods.Items) == 0 {
// 		log.Printf(" No pods found for app %s: %v", appName, err)
// 		return
// 	}

// 	pod := pods.Items[0]
// 	log.Printf(" Streaming logs from pod: %s", pod.Name)

// 	// Thử stream logs với retry
// 	maxRetries := 3
// 	for i := 0; i < maxRetries; i++ {
// 		err = k.streamPodLogs(ctx, pod.Name, appName, serviceId)
// 		if err == nil {
// 			break
// 		}

// 		log.Printf(" Log stream error (attempt %d/%d): %v", i+1, maxRetries, err)
// 		if i < maxRetries-1 {
// 			time.Sleep(5 * time.Second)

// 			// Kiểm tra lại pod status
// 			if updatedPod, err := k.clientset.CoreV1().Pods(k.namespace).Get(ctx, pod.Name, metav1.GetOptions{}); err == nil {
// 				if updatedPod.Status.Phase != corev1.PodRunning {
// 					log.Printf(" Pod %s is no longer running (status: %s), stopping log stream",
// 						updatedPod.Name, updatedPod.Status.Phase)
// 					return
// 				}
// 			}
// 		}
// 	}
// }

// func (k *K8sManager) streamPodLogs(ctx context.Context, podName, appName string, serviceId string) error {
// 	req := k.clientset.CoreV1().Pods(k.namespace).GetLogs(podName, &corev1.PodLogOptions{
// 		Follow:    true,
// 		TailLines: &[]int64{100}[0], // Lấy 100 dòng cuối cùng
// 	})

// 	stream, err := req.Stream(ctx)
// 	if err != nil {
// 		return fmt.Errorf("error creating log stream: %v", err)
// 	}
// 	defer stream.Close()

// 	log.Printf(" Starting to stream logs from pod: %s", podName)
// 	data := broadcastMessage.BroadcastMessage{
// 		ServiceId: serviceId,
// 		Data:      []byte(fmt.Sprintf(`{"app":"%s","log":"=== Starting log stream ===\n"}`, appName)),
// 	}
// 	k.hub.Broadcast <- data

// 	buf := make([]byte, 1024)
// 	for {
// 		select {
// 		case <-ctx.Done():
// 			log.Printf(" Log stream context cancelled for pod: %s", podName)
// 			return nil
// 		default:
// 			n, err := stream.Read(buf)
// 			if n > 0 {
// 				message := strings.TrimSuffix(string(buf[:n]), "\n")
// 				// In ra console backend
// 				log.Printf("[%s] %s", appName, message)
// 				// Broadcast lên client WebSocket (escape JSON)
// 				escapedMessage := strings.ReplaceAll(message, `"`, `\"`)
// 				data := broadcastMessage.BroadcastMessage{
// 					ServiceId: serviceId,
// 					Data:      []byte(fmt.Sprintf(`{"app":"%s","log":"%s\n"}`, appName, escapedMessage)),
// 				}
// 				k.hub.Broadcast <- data
// 			}
// 			if err != nil {
// 				if err == io.EOF {
// 					log.Printf(" End of log stream for pod: %s", podName)
// 					data := broadcastMessage.BroadcastMessage{
// 						ServiceId: serviceId,
// 						Data:      []byte(fmt.Sprintf(`{"app":"%s","log":"=== End of logs ===\n"}`, appName)),
// 					}
// 					k.hub.Broadcast <- data
// 					return nil
// 				}
// 				return fmt.Errorf("error reading log stream: %v", err)
// 			}
// 		}
// 	}
// }
