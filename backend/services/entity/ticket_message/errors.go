package ticketmessage

import "errors"

var (
	ErrInvalidMessage     = errors.New("message content không hợp lệ")
	ErrInvalidMessageType = errors.New("message type không hợp lệ ('user' or 'admin')")
)
