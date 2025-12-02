package utils

import (
	"regexp"
	"strings"
)

// sanitizeK8sName converts a string to a valid Kubernetes resource name
func SanitizeK8sName(name string) string {
	// Convert to lowercase
	name = strings.ToLower(name)

	// Replace invalid characters with hyphens
	reg := regexp.MustCompile(`[^a-z0-9-.]`)
	name = reg.ReplaceAllString(name, "-")

	// Remove leading and trailing hyphens
	name = strings.Trim(name, "-")

	// Ensure it doesn't start with a number or dot
	if len(name) > 0 && (name[0] >= '0' && name[0] <= '9' || name[0] == '.') {
		name = "k-" + name
	}

	// Truncate if too long (Kubernetes limit is 63 characters)
	if len(name) > 63 {
		name = name[:63]
		name = strings.Trim(name, "-")
	}

	return name
}
