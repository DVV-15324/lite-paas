package storagesub

import "errors"

var (
	//ErrStorageSubInvalidLinkReturn = errors.New("link return không hợp lệ")
	ErrStorageSubInvalidUsername = errors.New("username không hợp lệ")
	ErrStorageSubInvalidPassword = errors.New("password không hợp lệ")
	ErrStorageSubInvalidPort     = errors.New("port không hợp lệ")
)
