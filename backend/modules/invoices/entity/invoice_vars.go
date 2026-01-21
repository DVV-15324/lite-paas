package invoice

import (
	"time"
)

type CreateInvoice struct {
	ServiceID     int64   `json:"-" db:"service_id"`
	FakeServiceId string  `json:"service_id" db:"-"`
	ServiceType   string  `json:"service_type" db:"service_type"`
	Amount        float64 `json:"amount" db:"amount"`
	PaymentMethod string  `json:"payment_method" db:"payment_method"`
	//Status        string     `json:"status" db:"status"`
	DueDate *time.Time `json:"due_date,omitempty" db:"due_date"`
}

func (c *CreateInvoice) Validate() error {

	if err := CheckAmount(c.Amount); err != nil {
		return err
	}
	// if err := CheckStatus(c.Status); err != nil {
	// 	return err
	// }
	return nil
}

type UpdateInvoice struct {
	Status  *string    `json:"status,omitempty" db:"status"`
	PaidAt  *time.Time `json:"paid_at,omitempty" db:"paid_at"`
	DueDate *time.Time `json:"due_date,omitempty" db:"due_date"`
}

func (u *UpdateInvoice) Validate() error {

	if u.Status != nil {
		if err := CheckStatus(*u.Status); err != nil {
			return err
		}
	}

	if u.DueDate != nil && u.PaidAt != nil && u.DueDate.Before(*u.PaidAt) {
		return ErrInvalidDueDate
	}

	return nil
}
