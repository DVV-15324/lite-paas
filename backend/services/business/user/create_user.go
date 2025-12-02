package user

import (
	c_errors "lite-paas/common/errors"

	"context"
	entityUser "lite-paas/services/entity/user"
	"net/http"
)

func (u *BusinessUser) BzCreateUser(ctx context.Context, cu *entityUser.CreateUserForm) (int, *c_errors.AppError) {
	err_v := cu.Validate()
	if err_v != nil {
		app := c_errors.NewAppError(400, http.StatusText(400), err_v)
		return 0, app
	}
	uid, err := u.userReponsitory.CreateUser(ctx, cu)
	if err != nil {
		app := c_errors.NewAppError(500, http.StatusText(500), err)
		return 0, app
	}
	return uid, nil
}
