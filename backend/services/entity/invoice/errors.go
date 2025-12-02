package invoice

import "errors"

var (
	ErrInvalidAmount  = errors.New("amount must be greater than 0")
	ErrInvalidStatus  = errors.New("status is not valid or empty")
	ErrInvalidDueDate = errors.New("due date cannot be before created date or paid date")
)
