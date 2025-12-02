package auth

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	c_errors "lite-paas/common/errors"
	c_jwt "lite-paas/common/jwt"
	c_uid "lite-paas/common/uid"
	entityAuth "lite-paas/services/entity/auth"
	"net/http"

	"github.com/google/uuid"
	"gopkg.in/mail.v2"
)

func generatePassWord(length int) string {
	bytes := make([]byte, length)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func (bz *BusinessAuth) BzForgetPassword(ctx context.Context, data *entityAuth.ForgotPassword) (*string, *c_errors.AppError) {

	if err := data.Validate(); err != nil {
		app := c_errors.NewAppError(400, http.StatusText(400), err)
		return nil, app
	}

	auth, err_a := bz.bzAuth.GetAuthByEmail(ctx, data.Email)
	if err_a != nil {
		app := c_errors.NewAppError(500, http.StatusText(500), err_a)
		return nil, app
	}
	user, err_u := bz.bzUser.BzGetUsersById(ctx, auth.UserId)
	if err_u != nil {
		return nil, err_u
	}
	s := c_uid.NewUID(uint32(user.Id), 1)
	sub := s.ToBase58()
	tid := uuid.New().String()
	token_forget := c_jwt.NewJwtServer("vu-dep-trai-nhat-the-gioi", 900)
	token := token_forget.IssueToken(ctx, sub, tid)

	resetLink := fmt.Sprintf("https://litepaas.com/reset-password?token=%s", token.AccessToken.Token)

	if err := sendResetEmail(data.Email, resetLink); err != nil {
		app := c_errors.NewAppError(500, "Failed to send reset email", err)
		return nil, app
	}

	msg := "Password reset link sent successfully"
	return &msg, nil
}

const (
	from     = "dinhvietvu15032004bn@gmail.com"
	password = "mkup tews qrot qnmd"
	smtpHost = "smtp.gmail.com"
	smtpPort = 587
)

func sendResetEmail(to, link string) error {
	subject := "Reset your LitePaaS password"
	body := fmt.Sprintf(
		"Xin chào!\n\nClick vào link dưới đây để đặt lại mật khẩu LitePaaS của bạn:\n\n%s\n\nLiên kết này sẽ hết hạn sau 15 phút.\n\nTrân trọng,\nĐội ngũ LitePaaS",
		link,
	)

	m := mail.NewMessage()
	m.SetHeader("From", from)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/plain", body)

	// Tạo dialer SMTP
	d := mail.NewDialer(smtpHost, smtpPort, from, password)

	// Gửi mail
	if err := d.DialAndSend(m); err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}
