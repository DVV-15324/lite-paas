package auth

import (
	"context"
	c_errors "lite-paas/common/errors"
	c_jwt "lite-paas/common/jwt"
	c_uid "lite-paas/common/uid"
	entityAuth "lite-paas/services/entity/auth"
	"net/http"

	"github.com/google/uuid"
)

func (bz *BusinessAuth) LoginAuth(ctx context.Context, au *entityAuth.LoginForm) (*c_jwt.TokenResponse, *c_errors.AppError) {
	err := au.Validate()
	if err != nil {
		app := c_errors.NewAppError(400, http.StatusText(400), err)
		return nil, app
	}

	//Check tai khoan ko ton tai
	auth, err_a := bz.bzAuth.GetAuthByEmail(ctx, au.Email)
	if err_a != nil {
		app := c_errors.NewAppError(500, http.StatusText(500), err_a)
		return nil, app
	}
	//So sánh Hash Password
	ss := bz.hash.CompareHashAndPassword(auth.Password, au.Password, auth.Salt)
	if !ss {
		app := c_errors.NewAppError(500, http.StatusText(500), entityAuth.ErrorEmailAndPassword)
		return nil, app
	}
	//Tạo token
	s := c_uid.NewUID(uint32(auth.UserId), 1) //uid đã mask()
	sub := s.ToBase58()
	tid := uuid.New().String()
	token := bz.jwt.IssueToken(ctx, sub, tid)

	user, err_u := bz.bzUser.BzGetUsersById(ctx, auth.UserId)
	if err_u != nil {
		return nil, err_u
	}
	user.Mask()

	return token, nil
}
