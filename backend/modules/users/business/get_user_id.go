package user

import (
	c_errors "lite-paas/shared/errors"

	"context"
	entityUser "lite-paas/modules/users/entity"

	"net/http"
)

func (u *BusinessUser) BzGetUsersById(ctx context.Context, id int) (*entityUser.Users, *c_errors.AppError) {
	//kiem tra user
	user, err := u.userReponsitory.GetUserById(ctx, id)
	if err != nil {
		app := c_errors.NewAppError(404, http.StatusText(404), err)
		return nil, app
	}

	user.Mask()

	return user, nil
}
