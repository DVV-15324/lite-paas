package payment

import "errors"

var (
	ErrInvalidAmount         = errors.New("amount must be greater than 0")
	ErrInvalidStatus         = errors.New("status is not valid or empty")
	ErrInvalidPaymentGateway = errors.New("payment gateway is not valid")
)
