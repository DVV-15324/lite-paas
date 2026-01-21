package runtime

import (
	"context"
	"fmt"
	"log"
	"time"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/wait"
)

func (k *K8sManagerRuntime) WatchJob(appName, baseDomain string, memoryLimit int, cpuLimit float64) {
	jobName := fmt.Sprintf("kaniko-build-%s", appName)
	log.Printf("Monitoring job: %s", jobName)

	err := wait.PollUntilContextTimeout(context.Background(), 10*time.Second, 15*time.Minute, false,
		func(ctx context.Context) (bool, error) {
			job, err := k.clientset.BatchV1().Jobs(k.namespace).Get(ctx, jobName, metav1.GetOptions{})
			if err != nil {
				log.Printf("Error getting job %s: %v", jobName, err)
				return false, nil
			}

			if job.Status.Succeeded > 0 {
				log.Printf("Build successful: %s", job.Name)
				image := fmt.Sprintf("192.168.5.202:30000/%s:latest", appName)

				host, err := k.DeployApp(appName, image, baseDomain, 8080, memoryLimit, cpuLimit)
				if err != nil {
					log.Printf("sDeploy failed: %v", err)
				} else {
					log.Printf("App deployed successfully: %s -> %s", appName, host)
				}

				time.Sleep(30 * time.Second)
				k.deleteJob(ctx, jobName)
				return true, nil
			}

			if job.Status.Failed > 0 {
				log.Printf("Job failed: %s", jobName)
				time.Sleep(30 * time.Second)
				k.deleteJob(ctx, jobName)
				return true, nil
			}

			log.Printf("⏳ Job %s status: Succeeded=%d, Failed=%d, Active=%d",
				jobName, job.Status.Succeeded, job.Status.Failed, job.Status.Active)
			return false, nil
		})

	if err != nil {
		log.Printf("Error monitoring job: %v", err)
	}
}

func (k *K8sManagerRuntime) deleteJob(ctx context.Context, jobName string) {
	policy := metav1.DeletePropagationBackground
	_ = k.clientset.BatchV1().Jobs(k.namespace).Delete(ctx, jobName, metav1.DeleteOptions{
		PropagationPolicy: &policy,
	})
}
