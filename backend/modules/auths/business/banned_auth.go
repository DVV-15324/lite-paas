package auth

import (
	"context"

	c_errors "lite-paas/shared/errors"

	"net/http"
)

// Cap nhat bannad
func (bz *BusinessAuth) BzUpdateAuthBanned(ctx context.Context, banned int, userId int) *c_errors.AppError {
	//Kiem tra user
	user, err_user := bz.bzUser.BzGetUsersById(ctx, userId)
	if err_user != nil {
		return err_user
	}
	// update Auth
	err_auth := bz.bzAuth.UpdateAuthBanned(ctx, user.Email, banned)
	if err_auth != nil {
		app := c_errors.NewAppError(500, http.StatusText(500), err_auth)
		return app
	}
	return nil
}
