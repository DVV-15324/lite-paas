package user

import (
	"context"
	entityUser "lite-paas/services/entity/user"
)

type ResponsitoryUser interface {
	CreateUser(cxt context.Context, user *entityUser.CreateUserForm) (int, error)
	GetUserById(ctx context.Context, id int) (*entityUser.Users, error)
	UpdateUser(cxt context.Context, user *entityUser.UpdateUserForm, id int) error
	GetUserAll(ctx context.Context) ([]*entityUser.Users, error)
}

type BusinessUser struct {
	userReponsitory ResponsitoryUser
}

func NewBusinessUser(userReponsitory ResponsitoryUser) *BusinessUser {
	return &BusinessUser{
		userReponsitory: userReponsitory,
	}
}
