package user

import (
	c_errors "lite-paas/common/errors"

	"context"
	entityUser "lite-paas/services/entity/user"
)

type BusinessUser interface {
	BzCreateUser(ctx context.Context, cu *entityUser.CreateUserForm) (int, *c_errors.AppError)
	BzGetUsersById(ctx context.Context, id int) (*entityUser.Users, *c_errors.AppError)
	BzUpdateUser(ctx context.Context, up *entityUser.UpdateUserForm, id int) *c_errors.AppError
	BzGetUserAll(ctx context.Context) ([]*entityUser.Users, *c_errors.AppError)
}
type ApiUser struct {
	bz BusinessUser
}

func NewApiUser(bz BusinessUser) *ApiUser {
	return &ApiUser{
		bz: bz,
	}
}
