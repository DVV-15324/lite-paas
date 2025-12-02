package ticketmessage

import "strings"

func CheckMessage(msg string) error {
	if len(strings.TrimSpace(msg)) == 0 {
		return ErrInvalidMessage
	}
	return nil
}
