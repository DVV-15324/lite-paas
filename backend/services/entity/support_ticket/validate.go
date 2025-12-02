package supportticket

import "strings"

func CheckServiceType(serviceType string) error {
	if len(strings.TrimSpace(serviceType)) == 0 {
		return ErrInvalidServiceType
	}
	return nil
}

func CheckTitle(title string) error {
	if len(strings.TrimSpace(title)) == 0 {
		return ErrInvalidTitle
	}
	return nil
}

func CheckContent(content string) error {
	if len(strings.TrimSpace(content)) == 0 {
		return ErrInvalidContent
	}
	return nil
}

func CheckStatus(status string) error {
	validStatuses := []string{"open", "in_progress", "closed"}
	if !Contains(validStatuses, strings.ToLower(status)) {
		return ErrInvalidStatus
	}
	return nil
}

func CheckPriority(priority string) error {
	validPriorities := []string{"low", "medium", "high"}
	if !Contains(validPriorities, strings.ToLower(priority)) {
		return ErrInvalidPriority
	}
	return nil
}

func Contains(list []string, val string) bool {
	for _, v := range list {
		if v == val {
			return true
		}
	}
	return false
}
