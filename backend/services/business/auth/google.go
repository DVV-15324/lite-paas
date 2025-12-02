package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	c_errors "lite-paas/common/errors"
	c_jwt "lite-paas/common/jwt"
	c_uid "lite-paas/common/uid"
	entityAuth "lite-paas/services/entity/auth"
	entityUser "lite-paas/services/entity/user"
	"net/http"

	"github.com/google/uuid"
)

func (bz *BusinessAuth) LoginWithGoogle(ctx context.Context, input *entityAuth.GoogleLoginForm) (*c_jwt.TokenResponse, *c_errors.AppError) {
	req, err := http.NewRequest("GET", "https://www.googleapis.com/oauth2/v3/userinfo", nil)
	if err != nil {
		return nil, c_errors.NewAppError(401, "Token Google không hợp lệ", err)
	}
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", input.AccessToken))

	client := http.Client{}
	resp, err := client.Do(req)

	if err != nil {
		return nil, c_errors.NewAppError(401, "Token Google không hợp lệ", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, c_errors.NewAppError(401, "Token Google không hợp lệ", err)
	}

	body, _ := ioutil.ReadAll(resp.Body)
	var userInfo map[string]interface{}
	if err := json.Unmarshal(body, &userInfo); err != nil {
		return nil, c_errors.NewAppError(401, "Token Google không hợp lệ", err)
	}

	// --- Bắt lỗi claim không tồn tại hoặc không đúng định dạng ---
	emailClaim, ok := userInfo["email"]
	if !ok {
		return nil, c_errors.NewAppError(400, "Không tìm thấy email trong token", nil)
	}
	email, ok := emailClaim.(string)
	if !ok {
		return nil, c_errors.NewAppError(400, "Email không hợp lệ", nil)
	}

	givenNameClaim, ok := userInfo["given_name"]
	if !ok {
		return nil, c_errors.NewAppError(400, "Không tìm thấy given_name trong token", nil)
	}
	firstName, ok := givenNameClaim.(string)
	if !ok {
		return nil, c_errors.NewAppError(400, "First name không hợp lệ", nil)
	}

	familyNameClaim, ok := userInfo["family_name"]
	if !ok {
		return nil, c_errors.NewAppError(400, "Không tìm thấy family_name trong token", nil)
	}
	lastName, ok := familyNameClaim.(string)
	if !ok {
		return nil, c_errors.NewAppError(400, "Last name không hợp lệ", nil)
	}

	// --- Kiểm tra user đã tồn tại hay chưa ---
	auth, err := bz.bzAuth.GetAuthByEmail(ctx, email)
	if err != nil || auth == nil {

		id, err_id := bz.bzUser.BzCreateUser(ctx, &entityUser.CreateUserForm{
			Email: email,
			Name:  fmt.Sprintf("%s %s", firstName, lastName),
		})
		if err_id != nil {
			fmt.Printf("Lỗi tạo user mới: %v", err)
			return nil, err_id
		}

		authEntity := &entityAuth.Auth{
			Email:  email,
			UserId: id,
		}
		if err := bz.bzAuth.CreateAuth(ctx, authEntity); err != nil {
			fmt.Printf("Lỗi tạo auth record: %v", err)
			return nil, c_errors.NewAppError(500, "Không thể tạo auth", err)
		}
		auth = authEntity

	}

	s := c_uid.NewUID(uint32(auth.UserId), 1)
	sub := s.ToBase58()
	tid := uuid.New().String()
	token := bz.jwt.IssueToken(ctx, sub, tid)

	// --- Lấy profile người dùng ---
	user, err_u := bz.bzUser.BzGetUsersById(ctx, auth.UserId)
	if err != nil {
		fmt.Printf("Lỗi lấy user profile: %v", err)
		return nil, err_u
	}
	user.Mask()

	return token, nil
}
