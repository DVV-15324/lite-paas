package database_sub

import "errors"

var (
	ErrDatabaseSubInvalidUsername = errors.New("username không hợp lệ")
	ErrDatabaseSubInvalidPassword = errors.New("password không hợp lệ")
)
