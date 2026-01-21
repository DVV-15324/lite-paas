package payment

import "strings"

func CheckAmount(amount float64) error {
	if amount <= 0 {
		return ErrInvalidAmount
	}
	return nil
}

func CheckPaymentGateway(gateway string) error {
	if len(strings.TrimSpace(gateway)) == 0 {
		return ErrInvalidPaymentGateway
	}
	return nil
}
