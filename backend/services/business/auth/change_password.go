package auth

import (
	"context"
	"fmt"
	c_errors "lite-paas/common/errors"
	entityAuth "lite-paas/services/entity/auth"
	"net/http"
)

func (bz *BusinessAuth) BzUpdateChangeAuth(ctx context.Context, data *entityAuth.ChangePasswordForm, userId int) *c_errors.AppError {
	err := data.Validate()
	if err != nil {
		app := c_errors.NewAppError(400, http.StatusText(400), err)
		return app
	}
	fmt.Println(data.NewPassword)
	// check tài khoản tồn tại
	user, _ := bz.bzUser.BzGetUsersById(ctx, userId)
	fmt.Println(user.Email)
	auth, _ := bz.bzAuth.GetAuthByEmail(ctx, user.Email)

	hashPass, err := bz.hash.GenerateFromPassword(data.NewPassword, auth.Salt)
	if err != nil {
		app := c_errors.NewAppError(500, http.StatusText(500), err)
		return app
	}
	fmt.Println(hashPass)
	// update Auth
	err_auth := bz.bzAuth.UpdateAuthPassWord(ctx, user.Email, hashPass)
	if err_auth != nil {
		app := c_errors.NewAppError(500, http.StatusText(500), err_auth)
		return app
	}
	return nil
}
