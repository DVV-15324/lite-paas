package auth

import (
	"context"
	entityAuth "lite-paas/modules/auths/entity"
	entityUser "lite-paas/modules/users/entity"
	c_errors "lite-paas/shared/errors"
	c_jwt "lite-paas/shared/jwt"
)

type ReponsitoryAuth interface {
	CreateAuth(cxt context.Context, auth *entityAuth.Auth) error
	GetAuthByEmail(ctx context.Context, email string) (*entityAuth.Auth, error)
	UpdateAuthBanned(cxt context.Context, email string, banned int) error
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
	IssueToken(ctx context.Context, sub string, tid string, role c_jwt.Role) (*c_jwt.TokenResponse, error)
}

type BusinessAuth struct {
	jwt    JwtService
	bzUser BzUser
	hash   Hash
	bzAuth ReponsitoryAuth

	cfg *entityAuth.Config
}

func NewBusinessAuth(jwt JwtService, bzUser BzUser, h Hash, bzAuth ReponsitoryAuth) *BusinessAuth {
	return &BusinessAuth{
		jwt:    jwt,
		bzUser: bzUser,
		hash:   h,
		bzAuth: bzAuth,
	}
}
