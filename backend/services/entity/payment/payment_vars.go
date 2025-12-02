package payment

import "strings"

type CreatePayment struct {
	InvoiceId      int64
	Amount         float64
	PaymentGateway *string
	TransactionID  *string
}

func (c *CreatePayment) Validate() error {
	if err := CheckAmount(c.Amount); err != nil {
		return err
	}

	if c.PaymentGateway != nil {
		if err := CheckPaymentGateway(*c.PaymentGateway); err != nil {
			return err
		}
	}
	return nil
}

type UpdatePayment struct {
	Amount         *float64 `json:"amount,omitempty" db:"amount"`
	PaymentGateway *string  `json:"payment_gateway,omitempty" db:"payment_gateway"`
	TransactionID  *string  `json:"transaction_id,omitempty" db:"transaction_id"`
}

func (u *UpdatePayment) Validate() error {
	if u.Amount != nil && *u.Amount <= 0 {
		return ErrInvalidAmount
	}

	if u.PaymentGateway != nil && len(strings.TrimSpace(*u.PaymentGateway)) == 0 {
		return ErrInvalidPaymentGateway
	}
	return nil
}
