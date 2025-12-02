package runtime

import (
	"context"
	"fmt"
	"io"
	"log"
	"strings"
	"time"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/wait"
	broadcastMessage "lite-paas/common/hub"
)

// WatchJob monitors the Kaniko build job and triggers deployment when successful
func (k *K8sManagerRuntime) WatchJob(appName string, user string, serviceId string, baseDomain string) {
	jobName := fmt.Sprintf("kaniko-build-%s", appName)
	log.Printf("🔍 Monitoring job: %s", jobName)

	err := wait.PollUntilContextTimeout(context.Background(), 10*time.Second, 15*time.Minute, false,
		func(ctx context.Context) (bool, error) {
			job, err := k.clientset.BatchV1().Jobs(k.namespace).Get(ctx, jobName, metav1.GetOptions{})
			if err != nil {
				log.Printf("⚠️ Error getting job %s: %v", jobName, err)
				return false, nil // Continue retrying
			}

			// Job succeeded
			if job.Status.Succeeded > 0 {
				log.Printf("✅ Build successful: %s", job.Name)
				image := fmt.Sprintf("192.168.5.202:30000/%s:latest", appName)

				// Deploy the application
				host, err := k.DeployApp(appName, image, baseDomain, 8080)
				if err != nil {
					k.sendStatusMessage(serviceId, appName, "failed", fmt.Sprintf("Deploy failed: %v", err))
					log.Printf("❌ App deployment failed: %v", err)
				} else {
					k.sendStatusMessage(serviceId, appName, "active", host)
					log.Printf("🚀 App deployed successfully: %s -> %s", appName, host)
					go k.waitAndStreamAppLogs(appName, serviceId)
				}

				// Keep job for a while for debugging, then delete
				time.Sleep(30 * time.Second)
				k.deleteJob(ctx, jobName)
				return true, nil
			}

			// Job failed
			if job.Status.Failed > 0 {
				log.Printf("❌ Job failed: %s", jobName)

				// Get detailed failure information
				if pods, err := k.getJobPods(ctx, jobName); err == nil && len(pods) > 0 {
					for _, pod := range pods {
						k.logDetailedPodStatus(pod)
						if logs, err := k.getPodLogs(ctx, pod.Name); err == nil {
							log.Printf("📋 Logs from pod %s:\n%s", pod.Name, logs)
							// Send important log excerpts via WebSocket
							k.sendLogMessage(serviceId, appName, fmt.Sprintf("Build failed. Check logs for details."))
						}
					}
				} else {
					k.sendLogMessage(serviceId, appName, "Build job failed - no pod information available")
				}

				k.sendStatusMessage(serviceId, appName, "failed", "Build process failed")
				// Keep failed job for debugging, delete after delay
				time.Sleep(60 * time.Second)
				k.deleteJob(ctx, jobName)
				return true, nil
			}

			// Job still running - check pod status
			if pods, err := k.getJobPods(ctx, jobName); err == nil {
				for _, pod := range pods {
					k.logPodStatus(pod, serviceId, appName)
				}
			}

			log.Printf("⏳ Job %s status: Succeeded=%d, Failed=%d, Active=%d",
				jobName, job.Status.Succeeded, job.Status.Failed, job.Status.Active)
			return false, nil
		})

	if err != nil {
		log.Printf("❌ Error monitoring job: %v", err)
		k.sendStatusMessage(serviceId, appName, "failed", fmt.Sprintf("Job monitoring failed: %v", err))
	}
}

// Get pods associated with a job
func (k *K8sManagerRuntime) getJobPods(ctx context.Context, jobName string) ([]corev1.Pod, error) {
	pods, err := k.clientset.CoreV1().Pods(k.namespace).List(ctx, metav1.ListOptions{
		LabelSelector: fmt.Sprintf("job-name=%s", jobName),
	})
	if err != nil {
		return nil, err
	}
	return pods.Items, nil
}

// Get logs from a pod
func (k *K8sManagerRuntime) getPodLogs(ctx context.Context, podName string) (string, error) {
	req := k.clientset.CoreV1().Pods(k.namespace).GetLogs(podName, &corev1.PodLogOptions{})
	logs, err := req.Do(ctx).Raw()
	if err != nil {
		return "", err
	}
	return string(logs), nil
}

// Get last N lines of logs from a pod
func (k *K8sManagerRuntime) getPodLogsTail(ctx context.Context, podName string, tailLines int64) (string, error) {
	req := k.clientset.CoreV1().Pods(k.namespace).GetLogs(podName, &corev1.PodLogOptions{
		TailLines: &tailLines,
	})
	logs, err := req.Do(ctx).Raw()
	if err != nil {
		return "", err
	}
	return string(logs), nil
}

// Log detailed pod status
func (k *K8sManagerRuntime) logDetailedPodStatus(pod corev1.Pod) {
	log.Printf("📦 Pod %s: Phase=%s, Reason=%s", pod.Name, pod.Status.Phase, pod.Status.Reason)

	for _, containerStatus := range pod.Status.ContainerStatuses {
		if containerStatus.State.Waiting != nil {
			log.Printf("   🐳 Container %s: Waiting - %s: %s",
				containerStatus.Name,
				containerStatus.State.Waiting.Reason,
				containerStatus.State.Waiting.Message)
		}
		if containerStatus.State.Running != nil {
			log.Printf("   ✅ Container %s: Running since %v",
				containerStatus.Name,
				containerStatus.State.Running.StartedAt)
		}
		if containerStatus.State.Terminated != nil {
			log.Printf("   💀 Container %s: Terminated - ExitCode=%d, Reason=%s",
				containerStatus.Name,
				containerStatus.State.Terminated.ExitCode,
				containerStatus.State.Terminated.Reason)
		}
	}
}

// Log pod status and send updates via WebSocket
func (k *K8sManagerRuntime) logPodStatus(pod corev1.Pod, serviceId string, appName string) {
	if pod.Status.Phase == corev1.PodPending {
		for _, condition := range pod.Status.Conditions {
			if condition.Status == corev1.ConditionFalse {
				message := fmt.Sprintf("Build pending: %s", condition.Message)
				log.Printf("⚠️ %s", message)
				k.sendLogMessage(serviceId, appName, message)
			}
		}

		for _, containerStatus := range pod.Status.ContainerStatuses {
			if containerStatus.State.Waiting != nil {
				message := fmt.Sprintf("Container waiting: %s - %s",
					containerStatus.State.Waiting.Reason,
					containerStatus.State.Waiting.Message)
				k.sendLogMessage(serviceId, appName, message)
			}
		}
	}
}

// NEW FUNCTION: Get application logs (last 20 lines) without streaming
func (k *K8sManagerRuntime) GetAppLogsTail(appName string, serviceId string, tailLines int64) {
	log.Printf("📄 Getting last %d lines of logs for app: %s", tailLines, appName)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Get all pods for the application
	pods, err := k.clientset.CoreV1().Pods(k.namespace).List(ctx, metav1.ListOptions{
		LabelSelector: fmt.Sprintf("app=%s", appName),
	})
	if err != nil {
		errorMsg := fmt.Sprintf("❌ Error getting pods for app %s: %v", appName, err)
		log.Printf(errorMsg)
		k.sendLogMessage(serviceId, appName, errorMsg)
		return
	}

	if len(pods.Items) == 0 {
		noPodsMsg := fmt.Sprintf("📭 No pods found for app: %s", appName)
		log.Printf(noPodsMsg)
		k.sendLogMessage(serviceId, appName, noPodsMsg)
		return
	}

	// Get logs from each pod
	for _, pod := range pods.Items {

		if pod.Status.Phase == corev1.PodRunning || pod.Status.Phase == corev1.PodSucceeded {
			logs, err := k.getPodLogsTail(ctx, pod.Name, tailLines)
			if err != nil {
				errorMsg := fmt.Sprintf("❌ Error getting logs from pod %s: %v", pod.Name, err)
				log.Printf(errorMsg)
				k.sendLogMessage(serviceId, appName, errorMsg)
				continue
			}

			// Send logs line by line
			lines := strings.Split(logs, "\n")
			for _, line := range lines {
				if strings.TrimSpace(line) != "" {
					k.sendLogMessage(serviceId, appName, fmt.Sprintf("[%s] %s", pod.Name, line))
				}
			}
		} else {
			statusMsg := fmt.Sprintf("⏸️  Pod %s is not running (Status: %s), cannot get logs", pod.Name, pod.Status.Phase)
			log.Printf(statusMsg)
			k.sendLogMessage(serviceId, appName, statusMsg)
		}
	}

}

// Monitor and stream logs for all pods of an app
func (k *K8sManagerRuntime) waitAndStreamAppLogs(appName string, serviceId string) {
	log.Printf("Starting log stream for app: %s", appName)

	trackedPods := make(map[string]struct{})

	for {
		// Get list of pods
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		pods, err := k.clientset.CoreV1().Pods(k.namespace).List(ctx, metav1.ListOptions{
			LabelSelector: fmt.Sprintf("app=%s", appName),
		})
		cancel()

		if err != nil {
			log.Printf("⚠️ Error getting pods: %v", err)
			time.Sleep(10 * time.Second)
			continue
		}

		// Stream logs for new pods
		for _, pod := range pods.Items {
			if pod.Status.Phase != corev1.PodRunning {
				continue
			}

			if _, exists := trackedPods[pod.Name]; !exists {
				trackedPods[pod.Name] = struct{}{}
				go k.startPodLogStream(pod, appName, serviceId, trackedPods)
			}
		}

		time.Sleep(5 * time.Second)
	}
}

// Start log stream for a pod
func (k *K8sManagerRuntime) startPodLogStream(pod corev1.Pod, appName string, serviceId string, trackedPods map[string]struct{}) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	err := k.streamPodLogs(ctx, pod.Name, appName, serviceId)
	if err != nil {
		log.Printf("⚠️ Error streaming logs from pod %s: %v", pod.Name, err)
	}

	delete(trackedPods, pod.Name)
}

// Stream logs directly from pod
func (k *K8sManagerRuntime) streamPodLogs(ctx context.Context, podName, appName string, serviceId string) error {
	tailLines := int64(100)
	req := k.clientset.CoreV1().Pods(k.namespace).GetLogs(podName, &corev1.PodLogOptions{
		Follow:    true,
		TailLines: &tailLines,
	})

	stream, err := req.Stream(ctx)
	if err != nil {
		return fmt.Errorf("error creating log stream: %v", err)
	}
	defer stream.Close()

	log.Printf("📡 Streaming logs from pod: %s", podName)
	k.sendLogMessage(serviceId, appName, "=== Starting log stream ===")

	buf := make([]byte, 1024)
	for {
		select {
		case <-ctx.Done():
			return nil
		default:
			n, err := stream.Read(buf)
			if n > 0 {
				message := strings.TrimSuffix(string(buf[:n]), "\n")
				log.Printf("[%s] %s", appName, message)
				k.sendLogMessage(serviceId, appName, message)
			}
			if err == io.EOF {
				k.sendLogMessage(serviceId, appName, "=== End of logs ===")
				return nil
			}
			if err != nil {
				return fmt.Errorf("error reading stream: %v", err)
			}
		}
	}
}

// Send log message via WebSocket
func (k *K8sManagerRuntime) sendLogMessage(serviceId string, appName string, message string) {
	// Escape quotes and newlines for JSON
	escapedMessage := strings.ReplaceAll(message, `"`, `\"`)
	escapedMessage = strings.ReplaceAll(escapedMessage, "\n", "\\n")

	data := broadcastMessage.BroadcastMessage{
		ServiceId: serviceId,
		Data: []byte(fmt.Sprintf(
			`{"app":"%s","log":"%s"}`, appName, escapedMessage)),
	}
	k.hub.Broadcast <- data
}

// Send status message via WebSocket
func (k *K8sManagerRuntime) sendStatusMessage(serviceId string, appName string, status string, host string) {
	data := broadcastMessage.BroadcastMessage{
		ServiceId: serviceId,
		Data: []byte(fmt.Sprintf(
			`{"app":"%s","status":"%s","host":"%s"}`, appName, status, host)),
	}
	k.hub.Broadcast <- data
}

// Delete job
func (k *K8sManagerRuntime) deleteJob(ctx context.Context, jobName string) {
	deletePolicy := metav1.DeletePropagationBackground
	err := k.clientset.BatchV1().Jobs(k.namespace).Delete(ctx, jobName, metav1.DeleteOptions{
		PropagationPolicy: &deletePolicy,
	})
	if err != nil {
		log.Printf("⚠️ Error deleting job %s: %v", jobName, err)
	} else {
		log.Printf("🗑️ Deleted job: %s", jobName)
	}
}
