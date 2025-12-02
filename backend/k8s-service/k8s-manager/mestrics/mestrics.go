package metrics

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/tools/remotecommand"
	metrics "k8s.io/metrics/pkg/client/clientset/versioned"
)

func ConnectRemoteK8s(kubeconfigPath string) (*kubernetes.Clientset, *rest.Config, error) {
	config, err := clientcmd.BuildConfigFromFlags("", kubeconfigPath)
	if err != nil {
		return nil, nil, err
	}
	config.TLSClientConfig.Insecure = true
	// Xóa CA
	config.TLSClientConfig.CAFile = ""
	config.TLSClientConfig.CAData = nil
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, nil, err
	}
	return clientset, config, nil
}

func ConnectToK8s() (*kubernetes.Clientset, *rest.Config, error) {
	config, err := rest.InClusterConfig()
	if err != nil {
		return nil, nil, err
	}
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, nil, err
	}
	return clientset, config, nil
}

type K8sManagerMetrics struct {
	clientset *kubernetes.Clientset
	config    *rest.Config
}

func NewK8sManagerMetrics(kubeconfigPath string) (*K8sManagerMetrics, error) {
	var clientset *kubernetes.Clientset
	var config *rest.Config
	var err error

	if kubeconfigPath != "" {
		clientset, config, err = ConnectRemoteK8s(kubeconfigPath)
	} else {
		clientset, config, err = ConnectToK8s()
	}
	if err != nil {
		return nil, err
	}

	return &K8sManagerMetrics{
		clientset: clientset,
		config:    config,
	}, nil
}

// PodRuntimeMetrics - Chỉ CPU và RAM (recommended)
type PodRuntimeMetrics struct {
	PodName    string
	Namespace  string
	MemoryUsed string
	CPUUsed    string
}

// PodFullMetrics - Đầy đủ cả storage (nếu cần)
type PodFullMetrics struct {
	PodName     string
	Namespace   string
	MemoryUsed  string
	CPUUsed     string
	StorageUsed string // Có thể là "N/A" nếu không lấy được
}

func (m *K8sManagerMetrics) GetPodRuntimeMetrics(deploymentName, namespace string) (*PodRuntimeMetrics, error) {
	const maxRetries = 3
	var lastErr error

	for i := 0; i < maxRetries; i++ {
		metrics, err := m.getPodRuntimeMetricsSingleAttempt(deploymentName, namespace)
		if err == nil {
			return metrics, nil
		}

		lastErr = err
		log.Printf("Attempt %d failed for %s/%s: %v", i+1, namespace, deploymentName, err)

		if i < maxRetries-1 {
			time.Sleep(2 * time.Second)
		}
	}

	return nil, fmt.Errorf("failed after %d attempts, last error: %v", maxRetries, lastErr)
}

func (m *K8sManagerMetrics) getPodRuntimeMetricsSingleAttempt(deploymentName, namespace string) (*PodRuntimeMetrics, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Lấy tất cả pod trong namespace
	allPods, err := m.clientset.CoreV1().Pods(namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to list pods in namespace %s: %v", namespace, err)
	}

	var podName string
	for _, pod := range allPods.Items {
		if pod.Status.Phase == "Running" && strings.Contains(pod.Name, deploymentName) {
			podName = pod.Name
			break
		}
	}
	if podName == "" {
		return &PodRuntimeMetrics{
			PodName:   "N/A",
			Namespace: namespace,
		}, nil
	}

	// Tạo metrics client
	metricsClient, err := metrics.NewForConfig(m.config)
	if err != nil {
		return nil, fmt.Errorf("failed to create metrics client: %v", err)
	}

	// Lấy metrics cho pod
	podMetrics, err := metricsClient.MetricsV1beta1().PodMetricses(namespace).Get(ctx, podName, metav1.GetOptions{})
	if err != nil {
		log.Printf("Pod '%s' found but metrics unavailable: %v", podName, err)

		// Thử kiểm tra metrics-server availability
		metricsList, listErr := metricsClient.MetricsV1beta1().PodMetricses(namespace).List(ctx, metav1.ListOptions{})
		if listErr != nil {
			log.Printf("Cannot list all metrics: %v", listErr)
		} else {
			log.Printf("Available pods in metrics-server:")
			for _, mPod := range metricsList.Items {
				log.Printf("- %s", mPod.Name)
			}
		}

		return &PodRuntimeMetrics{
			PodName:    podName,
			Namespace:  namespace,
			MemoryUsed: "N/A",
			CPUUsed:    "N/A",
		}, nil
	}

	// Lấy container đầu tiên
	var memoryUsed, cpuUsed string
	if len(podMetrics.Containers) > 0 {
		container := podMetrics.Containers[0]
		memoryUsed = container.Usage.Memory().String()
		cpuUsed = container.Usage.Cpu().String()

		// Fix CPU nếu là 0
		if cpuUsed == "0" {
			cpuUsed = "1m" // Giá trị mặc định nhỏ nhất
		}
	} else {
		memoryUsed = "0Ki"
		cpuUsed = "1m"
	}

	return &PodRuntimeMetrics{
		PodName:    podName,
		Namespace:  namespace,
		MemoryUsed: memoryUsed,
		CPUUsed:    cpuUsed,
	}, nil
}

// GetPodFullMetrics - Lấy đầy đủ cả storage (phức tạp hơn)
func (m *K8sManagerMetrics) GetPodFullMetrics(deploymentName, namespace string, serviceType string) (*PodFullMetrics, error) {
	ctx := context.Background()

	// DEBUG: In ra thông tin để kiểm tra
	log.Printf("Đang tìm pods với label app=%s trong namespace %s", deploymentName, namespace)

	// Lấy Pod của Deployment
	pods, err := m.clientset.CoreV1().Pods(namespace).List(ctx, metav1.ListOptions{
		LabelSelector: "app=" + deploymentName,
	})
	if err != nil {
		log.Printf("Lỗi khi lấy pods: %v", err)
		return nil, fmt.Errorf("Lỗi khi lấy pods: %v", err)
	}

	if len(pods.Items) == 0 {
		// DEBUG: In ra tất cả pods trong namespace để xem có gì
		allPods, _ := m.clientset.CoreV1().Pods(namespace).List(ctx, metav1.ListOptions{})
		log.Printf("Không tìm thấy pod với label app=%s", deploymentName)
		log.Printf("Tất cả pods trong namespace %s:", namespace)
		for _, p := range allPods.Items {
			log.Printf(" - Pod: %s, Labels: %v", p.Name, p.Labels)
		}
		return nil, fmt.Errorf("Không tìm thấy Pod cho Deployment %s", deploymentName)
	}

	pod := pods.Items[0]
	log.Printf("Tìm thấy pod: %s", pod.Name)

	// Lấy metrics từ metrics-server (CPU & RAM)
	metricsClient, err := metrics.NewForConfig(m.config)
	if err != nil {
		return nil, fmt.Errorf("Không thể tạo metrics client: %v", err)
	}

	podMetrics, err := metricsClient.MetricsV1beta1().PodMetricses(namespace).Get(ctx, pod.Name, metav1.GetOptions{})
	if err != nil {
		return nil, fmt.Errorf("Không lấy được metrics: %v", err)
	}

	var memoryUsed, cpuUsed string
	for _, container := range podMetrics.Containers {
		memoryUsed = container.Usage.Memory().String()
		cpuUsed = container.Usage.Cpu().String()
		break
	}

	// Lấy storage usage (có thể fail)
	storageUsed, err := m.getStorageUsage(pod.Name, namespace, pod.Spec.Containers[0].Name, serviceType)
	if err != nil {
		// Nếu không lấy được storage, vẫn trả về các metrics khác
		storageUsed = "N/A"
	}

	return &PodFullMetrics{
		PodName:     pod.Name,
		Namespace:   namespace,
		MemoryUsed:  memoryUsed,
		CPUUsed:     cpuUsed,
		StorageUsed: storageUsed,
	}, nil
}

func ChooseLink(serviceType string) []string {
	// Giả sử chúng ta có service type
	var paths []string
	switch serviceType {
	case "mysql":
		paths = []string{"/var/lib/mysql", "/data"}
	case "mssql":
		paths = []string{"/var/opt/mssql/data", "/data"}
	case "mongo":
		paths = []string{"/data/db", "/data"}
	case "minio":
		paths = []string{"/data"}
	default:
		paths = []string{"/data"}
	}
	return paths
}
func (m *K8sManagerMetrics) getStorageUsage(podName, namespace, containerName, serviceType string) (string, error) {
	paths := ChooseLink(serviceType)

	var stdout, stderr strings.Builder
	var result string

	for _, p := range paths {
		cmd := []string{"sh", "-c", fmt.Sprintf("du -sh %s 2>/dev/null || echo 'N/A'", p)}

		req := m.clientset.CoreV1().RESTClient().
			Post().
			Resource("pods").
			Name(podName).
			Namespace(namespace).
			SubResource("exec").
			Param("container", containerName)

		for _, c := range cmd {
			req.Param("command", c)
		}

		req.Param("stdout", "true").Param("stderr", "true")

		exec, err := remotecommand.NewSPDYExecutor(m.config, "POST", req.URL())
		if err != nil {
			continue
		}

		stdout.Reset()
		stderr.Reset()

		err = exec.Stream(remotecommand.StreamOptions{
			Stdout: &stdout,
			Stderr: &stderr,
		})
		if err != nil {
			continue
		}

		result = strings.TrimSpace(stdout.String())

		if !strings.Contains(result, "N/A") && result != "" {
			fields := strings.Fields(result)
			if len(fields) > 0 {
				return fields[0], nil
			}
		}
	}

	return "N/A", nil
}

// GetMultiplePodsRuntimeMetrics - Lấy metrics cho nhiều pods (chỉ CPU/RAM)
func (m *K8sManagerMetrics) GetMultiplePodsRuntimeMetrics(deploymentName, namespace string) ([]PodRuntimeMetrics, error) {
	ctx := context.Background()

	pods, err := m.clientset.CoreV1().Pods(namespace).List(ctx, metav1.ListOptions{
		LabelSelector: "app=" + deploymentName,
	})
	if err != nil {
		return nil, fmt.Errorf("Không thể lấy danh sách pods: %v", err)
	}
	if len(pods.Items) == 0 {
		return nil, fmt.Errorf("Không tìm thấy Pod nào cho Deployment %s", deploymentName)
	}

	metricsClient, err := metrics.NewForConfig(m.config)
	if err != nil {
		return nil, err
	}

	var results []PodRuntimeMetrics
	for _, pod := range pods.Items {
		podMetrics, err := metricsClient.MetricsV1beta1().PodMetricses(namespace).Get(ctx, pod.Name, metav1.GetOptions{})
		if err != nil {
			// Skip pod không lấy được metrics, tiếp tục với pod khác
			continue
		}

		var memoryUsed, cpuUsed string
		for _, container := range podMetrics.Containers {
			memoryUsed = container.Usage.Memory().String()
			cpuUsed = container.Usage.Cpu().String()
			break
		}

		results = append(results, PodRuntimeMetrics{
			PodName:    pod.Name,
			Namespace:  namespace,
			MemoryUsed: memoryUsed,
			CPUUsed:    cpuUsed,
		})
	}

	if len(results) == 0 {
		return nil, fmt.Errorf("Không lấy được metrics cho bất kỳ Pod nào")
	}

	return results, nil
}
