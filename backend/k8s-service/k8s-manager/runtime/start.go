package runtime

import (
	"fmt"
	hub "lite-paas/common/hub"

	"strings"

	"log"
)

func Deploy(hub *hub.ServiceHub, appName string, serviceId string, token string, url string, namespace string, baseDomain string, filedocker string) {

	k8s, err := NewK8sManagerRuntime(namespace, baseDomain, "./k8s-service/config.yaml", hub)
	if err != nil {
		log.Printf("Failed to connect to Kubernetes: %v", err)
		return
	}

	log.Println("Connected to Kubernetes cluster")
	if err := k8s.EnsureNamespace(); err != nil {
		log.Println("Namespace error")
		return
	}

	userGit, repoGit, err := ParseGitURL(url)
	if err != nil {
		log.Printf("Invalid git URL: %v", err)
		return
	}

	if errKaniko := k8s.CreateKanikoJob(appName, repoGit, userGit, token, filedocker); errKaniko != nil {
		log.Printf("Failed to create Kaniko job: %v", errKaniko)
		return
	}

	fmt.Println("Kaniko job created successfully")
	go k8s.WatchJob(appName, userGit, serviceId, baseDomain)
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
