package auth

import (
	c_errors "lite-paas/shared/errors"
	c_jwt "lite-paas/shared/jwt"

	"context"
	entityAuth "lite-paas/modules/auths/entity"
)

type BusinessChat interface {
	BzLoginAuth(ctx context.Context, au *entityAuth.LoginForm) (*c_jwt.TokenResponse, *c_errors.AppError)
	BzRegisterAuth(ctx context.Context, auth *entityAuth.RegisterForm) *c_errors.AppError
	BzUpdateAuthBanned(ctx context.Context, banned int, userId int) *c_errors.AppError
}
type ApiAuth struct {
	bz BusinessChat
}

func NewApiAuth(bz BusinessChat) *ApiAuth {
	return &ApiAuth{
		bz: bz,
	}
}
