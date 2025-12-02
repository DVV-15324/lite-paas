package auth

import (
	c_errors "lite-paas/common/errors"
	c_jwt "lite-paas/common/jwt"

	"context"
	entityAuth "lite-paas/services/entity/auth"
)

type BusinessChat interface {
	LoginAuth(ctx context.Context, au *entityAuth.LoginForm) (*c_jwt.TokenResponse, *c_errors.AppError)
	BzRegisterAuth(ctx context.Context, auth *entityAuth.RegisterForm) *c_errors.AppError
	LoginWithGoogle(ctx context.Context, input *entityAuth.GoogleLoginForm) (*c_jwt.TokenResponse, *c_errors.AppError)
	BzForgetPassword(ctx context.Context, data *entityAuth.ForgotPassword) (*string, *c_errors.AppError)
}
type ApiAuth struct {
	bz BusinessChat
}

func NewApiAuth(bz BusinessChat) *ApiAuth {
	return &ApiAuth{
		bz: bz,
	}
}
