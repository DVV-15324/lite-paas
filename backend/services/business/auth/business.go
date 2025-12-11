package auth

import (
	"context"
	c_errors "lite-paas/common/errors"
	c_jwt "lite-paas/common/jwt"
	entityAuth "lite-paas/services/entity/auth"
	entityUser "lite-paas/services/entity/user"
)

type ReponsitoryAuth interface {
	CreateAuth(cxt context.Context, auth *entityAuth.Auth) error
	GetAuthByEmail(ctx context.Context, email string) (*entityAuth.Auth, error)
	UpdateAuthPassWord(cxt context.Context, email string, passwordSalt string) error
	UpdateAuthStatus(cxt context.Context, email string, status int) error
}

type Hash interface {
	GenerateFromPassword(password string, salt string) (string, error)
	CompareHashAndPassword(passwordStr string, password string, salt string) bool
}

type BzUser interface {
	BzCreateUser(ctx context.Context, cu *entityUser.CreateUserForm) (int, *c_errors.AppError)
	BzGetUsersById(ctx context.Context, id int) (*entityUser.Users, *c_errors.AppError)
}

type JwtService interface {
	ParseToken(ctx context.Context, tokenStr string) (*c_jwt.JwtClaims, error)
	IssueToken(cxt context.Context, sub string, tid string) *c_jwt.TokenResponse
}

type BusinessAuth struct {
	jwt    JwtService
	bzUser BzUser
	hash   Hash
	bzAuth ReponsitoryAuth

	cfg *entityAuth.Config
}

func NewBusinessAuth(jwt JwtService, bzUser BzUser, h Hash, bzAuth ReponsitoryAuth, cfg *entityAuth.Config) *BusinessAuth {
	return &BusinessAuth{
		jwt:    jwt,
		bzUser: bzUser,
		hash:   h,
		bzAuth: bzAuth,
		cfg:    cfg,
	}
}
