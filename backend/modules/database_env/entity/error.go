package database_env

import "errors"

var (
	ErrorEnvkeys   = errors.New("loi env key khong hop le")
	ErrorEnvValues = errors.New("loi env values khong hop le")
)
