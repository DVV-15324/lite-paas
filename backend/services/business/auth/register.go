package auth

import (
	"context"
	c_errors "lite-paas/common/errors"
	c_hash "lite-paas/common/hash"
	entityAuth "lite-paas/services/entity/auth"
	"lite-paas/services/entity/user"
	"net/http"
)

func (bz *BusinessAuth) BzRegisterAuth(ctx context.Context, auth *entityAuth.RegisterForm) *c_errors.AppError {
	err := auth.Validate()
	if err != nil {
		app := c_errors.NewAppError(400, http.StatusText(400), err)
		return app
	}
	// check tài khoản tồn tại
	authEmail, err := bz.bzAuth.GetAuthByEmail(ctx, auth.Email)
	if authEmail != nil {
		app := c_errors.NewAppError(409, http.StatusText(http.StatusConflict), entityAuth.ErrorEmailIsExisted)
		return app
	}
	if err != nil {
		app := c_errors.NewAppError(500, http.StatusText(500), err)
		return app
	}

	//Hash Pass
	randStr, err := c_hash.RandomStr()
	if err != nil {
		app := c_errors.NewAppError(500, http.StatusText(500), err)
		return app
	}
	hash, err := bz.hash.GenerateFromPassword(auth.Password, randStr)
	if err != nil {
		app := c_errors.NewAppError(500, http.StatusText(500), err)
		return app
	}
	// Tạo User
	userUid, err_user := bz.bzUser.BzCreateUser(ctx, &user.CreateUserForm{
		Email: auth.Email,
		Name:  auth.Name,
	})
	if err_user != nil {
		return err_user
	}
	// Tạo Auth
	err_auth := bz.bzAuth.CreateAuth(ctx, &entityAuth.Auth{
		Salt:     randStr,
		Email:    auth.Email,
		Password: hash,
		UserId:   userUid,
	})
	if err_auth != nil {
		app := c_errors.NewAppError(500, http.StatusText(500), err_auth)
		return app
	}
	return nil
}
