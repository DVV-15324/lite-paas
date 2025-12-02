package supportticket

import "errors"

var (
	ErrInvalidServiceType = errors.New("service type không hợp lệ")
	ErrInvalidTitle       = errors.New("title không hợp lệ")
	ErrInvalidContent     = errors.New("content không hợp lệ")
	ErrInvalidStatus      = errors.New("status không hợp lệ (open, in_progress, or closed)")
	ErrInvalidPriority    = errors.New("priority không hợp lệ (low, medium, or high)")
)
