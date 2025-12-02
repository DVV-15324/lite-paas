package errors

import ()

type AppError struct {
	Code    int
	Message string
	Err     error
}

func NewAppError(code int, msg string, err error) *AppError {
	return &AppError{Code: code, Message: msg, Err: err}
}
