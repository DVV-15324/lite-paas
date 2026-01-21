package k8smanager

import (
	"crypto/rand"
	"math/big"

	corev1 "k8s.io/api/core/v1"
)

// Utility functions
var hostPathDirectoryOrCreate = corev1.HostPathDirectoryOrCreate

func stringPtr(s string) *string {
	return &s
}

func int32Ptr(i int32) *int32 {
	return &i
}
func RandomPass() string {

	var password string

	password, _ = GenerateSecurePassword(16)

	return password
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
