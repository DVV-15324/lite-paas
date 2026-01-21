package middleware

import (
	"context"
	"errors"
	"github.com/gin-gonic/gin"
	c_ctx "lite-paas/shared/context"
	c_errors "lite-paas/shared/errors"
	c_jwt "lite-paas/shared/jwt"
	"net/http"
	"strings"
)

type BzAuth interface {
	BzIntrospectToken(ctx context.Context, accessToken string) (*c_jwt.JwtClaims, error)
}

// RequiredAuth - Middleware xác thực token từ header
func RequiredAuthAdmin(bzAuth BzAuth) func(c *gin.Context) {
	return func(c *gin.Context) {
		// Lấy token ở header
		token, err := extractTokenFromHeader(c.GetHeader("Authorization"))
		if err != nil {
			app := c_errors.NewAppError(401, http.StatusText(401), err)
			c_errors.NewErrorH(c, app)
			c.Abort()
			return
		}
		// xác thực token
		claims, er := bzAuth.BzIntrospectToken(c, token)
		if er != nil {
			app := c_errors.NewAppError(401, http.StatusText(401), er)
			c_errors.NewErrorH(c, app)
			c.Abort()
			return
		}

		// Kiểm tra role
		if claims.Role != "admin" {
			app := c_errors.NewAppError(403, http.StatusText(403), errors.New("chi co admin moi co quyen truy cap"))
			c_errors.NewErrorH(c, app)
			c.Abort()
			return
		}
		//New Request
		requestWithContext := c_ctx.NewRequestResponse(claims.Subject, claims.ID)
		// Lưu vào context
		c.Request = c.Request.WithContext(c_ctx.SaveRequestContext(c, requestWithContext))
		c.Next()
	}
}

// RequiredAuth - Middleware xác thực token từ header
func RequiredAuth(bzAuth BzAuth) func(c *gin.Context) {
	return func(c *gin.Context) {
		// Lấy token ở header
		token, err := extractTokenFromHeader(c.GetHeader("Authorization"))
		if err != nil {
			app := c_errors.NewAppError(401, http.StatusText(401), err)
			c_errors.NewErrorH(c, app)
			c.Abort()
			return
		}
		// xác thực token
		claims, er := bzAuth.BzIntrospectToken(c, token)
		if er != nil {
			app := c_errors.NewAppError(401, http.StatusText(401), er)
			c_errors.NewErrorH(c, app)
			c.Abort()
			return
		}

		//New Request
		requestWithContext := c_ctx.NewRequestResponse(claims.Subject, claims.ID)
		// Lưu vào context
		c.Request = c.Request.WithContext(c_ctx.SaveRequestContext(c, requestWithContext))
		c.Next()
	}
}

// extractTokenFromHeader - Trích xuất token từ header Authorization
func extractTokenFromHeader(accessToken string) (string, error) {
	if accessToken == "" {
		return "", errors.New("authorization header is required")
	}

	args := strings.Split(accessToken, " ")
	// Thiếu bearer, thiếu token, bị nhiều " "
	if len(args) != 2 || args[0] != "Bearer" {
		return "", errors.New("invalid authorization header format")
	}
	return args[1], nil
}
