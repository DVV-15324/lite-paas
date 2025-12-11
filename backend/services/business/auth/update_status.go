package auth

import (
	"context"

	c_errors "lite-paas/common/errors"

	"net/http"
)

func (bz *BusinessAuth) BzUpdateChangeAuthStatus(ctx context.Context, status int, userId int) *c_errors.AppError {

	user, _ := bz.bzUser.BzGetUsersById(ctx, userId)

	// update Auth
	err_auth := bz.bzAuth.UpdateAuthStatus(ctx, user.Email, status)
	if err_auth != nil {
		app := c_errors.NewAppError(500, http.StatusText(500), err_auth)
		return app
	}
	return nil
}
