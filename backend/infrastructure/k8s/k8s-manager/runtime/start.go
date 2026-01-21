package runtime

import (
	"fmt"

	"strings"

	"log"
)

func Deploy(appName string, serviceId string, token string, url string, namespace string, baseDomain string, filedocker string, memoryLimit int, cpuLimit float64, storageLimit int) {

	k8s, err := NewK8sManagerRuntime(namespace, baseDomain, "./infrastructure/k8s/config.yaml")
	if err != nil {
		log.Printf("Failed to connect to Kubernetes: %v", err)
		return
	}

	log.Println("Connected to Kubernetes cluster")

	userGit, repoGit, err := ParseGitURL(url)
	if err != nil {
		log.Printf("Invalid git URL: %v", err)
		return
	}

	if errKaniko := k8s.CreateKanikoJob(appName, repoGit, userGit, token, filedocker, storageLimit); errKaniko != nil {
		log.Printf("Failed to create Kaniko job: %v", errKaniko)
		return
	}

	fmt.Println("Kaniko job created successfully")
	go k8s.WatchJob(appName, baseDomain, memoryLimit, cpuLimit)
}
func ParseGitURL(url string) (user string, repo string, err error) {
	prefix := "https://github.com/"
	if !strings.HasPrefix(url, prefix) {
		return "", "", fmt.Errorf("invalid git url")
	}
	path := strings.TrimPrefix(url, prefix)

	parts := strings.Split(path, "/")
	if len(parts) != 2 {
		return "", "", fmt.Errorf("invalid git url format")
	}

	user = parts[0]
	repo = strings.TrimSuffix(parts[1], ".git")
	return user, repo, nil
}
