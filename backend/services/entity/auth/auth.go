package auth

import (
	"time"
)

type Auth struct {
	Email      string    `json:"email"`
	Password   string    `json:"password"`
	UserId     int       `json:"-"`
	Salt       string    `json:"salt"`
	Role       string    `json:"role"`
	Created_at time.Time `json:"created_at"`
	Updated_at time.Time `json:"updated_at"`
	Deleted_at time.Time `json:"deleted_at,omitempty"`
}

func TableName() string {
	return "auths"
}

type GoogleLoginForm struct {
	AccessToken string `json:"access_token"`
}
type Config struct {
	GoogleClientID string
}
