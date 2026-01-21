package user

import (
	"context"
	entityUser "lite-paas/modules/users/entity"
)

type ResponsitoryUser interface {
	CreateUser(cxt context.Context, user *entityUser.CreateUserForm) (int, error)
	GetUserById(ctx context.Context, id int) (*entityUser.Users, error)
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
