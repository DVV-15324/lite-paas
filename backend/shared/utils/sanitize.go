package utils

import (
	"regexp"
	"strings"
)

// Ham chuyen ten sang k8s cho phu hop
func SanitizeK8sName(name string) string {
	name = strings.ToLower(name)
	reg := regexp.MustCompile(`[^a-z0-9-.]`)
	name = reg.ReplaceAllString(name, "-")
	name = strings.Trim(name, "-")

	if len(name) > 0 && (name[0] >= '0' && name[0] <= '9' || name[0] == '.') {
		name = "k-" + name
	}

	if len(name) > 63 {
		name = name[:63]
		name = strings.Trim(name, "-")
	}

	return name
}
