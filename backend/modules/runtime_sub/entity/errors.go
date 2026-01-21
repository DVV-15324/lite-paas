package runtimesub

import "errors"

var (
	ErrRuntimeSubNotValidLinkGit      = errors.New("linkGit không hợp lệ")
	ErrRuntimeSubNotValidToken        = errors.New("token không hợp lệ")
	ErrorRuntimeSubNotValidLinkReturn = errors.New("link return không hợp lệ")
)
