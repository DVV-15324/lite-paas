package runtime

import (
	"strings"
)

func CheckName(name string) error {
	if strings.TrimSpace(name) == "" {
		return ErrorRuntimeNameNotValid
	}
	return nil
}

func CheckPrice(price float64) error {
	if price <= 0 {
		return ErrorRuntimePriceNotValid
	}
	return nil
}

func CheckDescription(descrip string) error {
	if strings.TrimSpace(descrip) == "" {
		return ErrorRuntimeDescribeNotValid
	}
	return nil
}

func CheckVersion(version string) error {
	if strings.TrimSpace(version) == "" {
		return ErrorRuntimeVersionNotValid
	}
	return nil
}
