package auth

import (
	"context"
	"errors"
	entityAuth "lite-paas/modules/auths/entity"
	c_errors "lite-paas/shared/errors"
	c_jwt "lite-paas/shared/jwt"
	c_uid "lite-paas/shared/uid"
	"net/http"

	"github.com/google/uuid"
)

func (bz *BusinessAuth) BzLoginAuth(ctx context.Context, au *entityAuth.LoginForm) (*c_jwt.TokenResponse, *c_errors.AppError) {
	//Kiem tra form
	err := au.Validate()
	if err != nil {
		app := c_errors.NewAppError(400, http.StatusText(400), err)
		return nil, app
	}

	//Check tai khoan ko ton tai
	auth, err_auth := bz.bzAuth.GetAuthByEmail(ctx, au.Email)
	if err_auth != nil {
		app := c_errors.NewAppError(404, http.StatusText(404), err_auth)
		return nil, app
	}
	//Kiểm tra banned
	if auth.Banned != false {
		app := c_errors.NewAppError(401, http.StatusText(401), errors.New("tai khoan cua ban da bi khoa"))
		return nil, app
	}
	//So sánh Hash Password
	ss := bz.hash.CompareHashAndPassword(auth.Password, au.Password, auth.Salt)
	if !ss {
		app := c_errors.NewAppError(500, http.StatusText(500), entityAuth.ErrorEmailAndPassword)
		return nil, app
	}
	//Tạo token
	s := c_uid.NewUID(uint32(auth.UserId), 1)
	// Mã hóa Base58
	sub := s.ToBase58()
	// Tạo mã định danh cho tokwn
	tid := uuid.New().String()

	//Tạo token
	token, _ := bz.jwt.IssueToken(ctx, sub, tid, c_jwt.Role(auth.Role))

	return token, nil
}
