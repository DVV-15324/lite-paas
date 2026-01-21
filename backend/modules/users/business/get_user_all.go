package user

import (
	c_errors "lite-paas/shared/errors"

	"context"
	entityUser "lite-paas/modules/users/entity"
	"net/http"
)

func (u *BusinessUser) BzGetUserAll(ctx context.Context) ([]*entityUser.Users, *c_errors.AppError) {

	users, err := u.userReponsitory.GetUserAll(ctx)
	if err != nil {
		app := c_errors.NewAppError(500, http.StatusText(500), err)
		return nil, app
	}
	return users, nil
}
