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
	Banned     bool      `json:"banned"`
	Created_at time.Time `json:"created_at"`
	Updated_at time.Time `json:"updated_at"`
}

func TableName() string {
	return "auths"
}

type Config struct {
	GoogleClientID string
}
