package docker

import (
	"crypto/rand"
	"fmt"

	"math/big"
)

func ChooseStorage(dbType string) (string, string, int, error) {

	var password string
	var userName string
	var port int
	switch dbType {
	case "mssql":
		userName = "sa"
		port = 1433
		password, _ = GenerateSecurePassword(12)

	case "mysql":
		userName = "root"
		port = 3306
		password, _ = GenerateSecurePassword(16)

	case "mongodb":
		port = 27017
		userName = "root"
		password, _ = GenerateSecurePassword(16)

	case "minio":
		port = 9001
		userName = "minioadmin"
		password, _ = GenerateSecurePassword(12)

	default:
		return "", "", 0, fmt.Errorf("unsupported database type: %s", dbType)
	}

	return userName, password, port, nil
}

func ChooseRuntime(dbType string) (string, error) {
	var dockerfileContent string
	switch dbType {
	case "golang":

		dockerfileContent = TempDockerGoLang()
	case "java":
		dockerfileContent = TempDockerJava()
	case "python":
		dockerfileContent = TempDockerPython()
	case "nodejs":
		dockerfileContent = TempDockerNode()
	default:
		return "", fmt.Errorf("unsupported runtime type: %s", dbType)
	}
	return dockerfileContent, nil
}

// GenerateSecurePassword tạo password an toàn dùng crypto/rand
func GenerateSecurePassword(length int) (string, error) {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"

	password := make([]byte, length)
	for i := range password {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
		if err != nil {
			return "", err
		}
		password[i] = chars[num.Int64()]
	}

	return string(password), nil
}
