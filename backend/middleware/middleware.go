package middleware

import (
	"context"
	"errors"
	"fmt"
	c_ctx "lite-paas/common/ctx"
	c_errors "lite-paas/common/errors"
	c_jwt "lite-paas/common/jwt"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type BzAuth interface {
	BzIntrospectToken(ctx context.Context, accessToken string) (*c_jwt.JwtClaims, error)
}

// RequiredAuth - Middleware xác thực token từ header
func RequiredAuth(bz BzAuth) func(c *gin.Context) {
	return func(c *gin.Context) {
		// Lấy token ở header
		token, err := extractTokenFromHeader(c.GetHeader("Authorization"))
		if err != nil {
			app := c_errors.NewAppError(403, http.StatusText(http.StatusForbidden), err)
			c_errors.NewErrorH(c, app)
			c.Abort()
			return
		}
		// xác thực token
		claims, er := bz.BzIntrospectToken(c, token)
		if er != nil {
			app := c_errors.NewAppError(403, http.StatusText(http.StatusForbidden), er)
			c_errors.NewErrorH(c, app)
			c.Abort()
			return
		}
		// Lưu vào context
		c.Request = c.Request.WithContext(c_ctx.SaveRequestContext(c, c_ctx.NewRequestResponse(claims.Subject, claims.ID)))
		c.Next()
	}
}

// RequiredAuthQuery - Middleware xác thực token từ query parameter
func RequiredAuthQuery(bz BzAuth) func(c *gin.Context) {
	return func(c *gin.Context) {
		// Lấy token từ query parameter
		token, err := extractTokenFromQuery(c)
		fmt.Println("token:")
		fmt.Println(token)
		if err != nil {
			app := c_errors.NewAppError(403, http.StatusText(http.StatusForbidden), err)
			c_errors.NewErrorH(c, app)
			c.Abort()
			return
		}
		// xác thực token
		claims, er := bz.BzIntrospectToken(c, token)
		if er != nil {
			app := c_errors.NewAppError(403, http.StatusText(http.StatusForbidden), er)
			c_errors.NewErrorH(c, app)
			c.Abort()
			return
		}
		// Lưu vào context
		c.Request = c.Request.WithContext(c_ctx.SaveRequestContext(c, c_ctx.NewRequestResponse(claims.Subject, claims.ID)))
		c.Next()
	}
}

func RequiredAuthAny(bz BzAuth) func(c *gin.Context) {
	return func(c *gin.Context) {
		log.Printf("🎯 [MIDDLEWARE] RequiredAuthAny MIDDLEWARE EXECUTING")
		log.Printf("🎯 [MIDDLEWARE] Path: %s", c.Request.URL.Path)
		log.Printf("🎯 [MIDDLEWARE] Method: %s", c.Request.Method)

		// Lấy token từ query parameter
		token := c.Query("token")
		log.Printf("🎯 [MIDDLEWARE] Token from query: %s", token)

		if token == "" {
			log.Printf("🎯 [MIDDLEWARE] No token found in query parameters")
			app := c_errors.NewAppError(403, "Token required", nil)
			c_errors.NewErrorH(c, app)
			c.Abort()
			return
		}

		log.Printf("🎯 [MIDDLEWARE] Validating token...")
		claims, err := bz.BzIntrospectToken(c, token)
		if err != nil {
			log.Printf("🎯 [MIDDLEWARE] Token validation failed: %v", err)
			app := c_errors.NewAppError(403, "Token validation failed", err)
			c_errors.NewErrorH(c, app)
			c.Abort()
			return
		}

		log.Printf("🎯 [MIDDLEWARE] Token validated - Subject: %s, ID: %d", claims.Subject, claims.ID)

		// Lưu vào context
		ctx := c_ctx.SaveRequestContext(c, c_ctx.NewRequestResponse(claims.Subject, claims.ID))
		c.Request = c.Request.WithContext(ctx)

		log.Printf("🎯 [MIDDLEWARE] Authentication successful")
		c.Next()
	}
}
func extractTokenFromQuery(c *gin.Context) (string, error) {
	// Kiểm tra tất cả các query parameter có thể chứa token
	tokenParams := []string{"token", "access_token", "auth_token", "authorization"}

	for _, param := range tokenParams {
		if token := c.Query(param); token != "" {
			log.Printf("🔐 [AUTH DEBUG] Found token in query param '%s': %s", param, token)
			return token, nil
		}
	}

	return "", errors.New("no token found in query parameters")
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

// OptionalAuth - Middleware xác thực token tùy chọn (không bắt buộc)
func OptionalAuth(bz BzAuth) func(c *gin.Context) {
	return func(c *gin.Context) {
		var token string
		var err error

		// Thử lấy token từ header trước
		token, err = extractTokenFromHeader(c.GetHeader("Authorization"))
		if err != nil {
			// Nếu header không có, thử lấy từ query parameter
			token, _ = extractTokenFromQuery(c)
		}

		// Nếu có token thì xác thực, không thì bỏ qua
		if token != "" {
			claims, er := bz.BzIntrospectToken(c, token)
			if er == nil {
				// Lưu vào context nếu token hợp lệ
				c.Request = c.Request.WithContext(c_ctx.SaveRequestContext(c, c_ctx.NewRequestResponse(claims.Subject, claims.ID)))
			}
			// Nếu token không hợp lệ, vẫn tiếp tục nhưng không có user context
		}

		c.Next()
	}
}
