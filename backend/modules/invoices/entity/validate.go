package invoice

import "strings"

func CheckAmount(amount float64) error {
	if amount <= 0 {
		return ErrInvalidAmount
	}
	return nil
}

func CheckStatus(status string) error {
	if len(strings.TrimSpace(status)) == 0 {
		return ErrInvalidStatus
	}
	return nil
}
