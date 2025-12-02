package user

import (
	c_errors "lite-paas/common/errors"

	"context"
	entityUser "lite-paas/services/entity/user"

	"net/http"
)

func (u *BusinessUser) BzUpdateUser(ctx context.Context, up *entityUser.UpdateUserForm, id int) *c_errors.AppError {
	if err := up.Validate(); err != nil {
		return c_errors.NewAppError(400, http.StatusText(400), err)
	}
	if err := u.userReponsitory.UpdateUser(ctx, up, id); err != nil {
		return c_errors.NewAppError(500, http.StatusText(500), err)
	}
	user, err := u.userReponsitory.GetUserById(ctx, id)
	if err != nil {
		return c_errors.NewAppError(404, http.StatusText(404), err)
	}
	user.Mask()

	return nil
}
