package auth

import (
	"context"
	"database/sql"
	"fmt"
)

func (u *AuthServiceSQL) UpdateAuthPassWord(cxt context.Context, email string, passwordSalt string) error {

	query := "UPDATE user_auth SET password=@password WHERE email = @email"

	_, err := u.db.ExecContext(cxt, query, sql.Named("password", passwordSalt), sql.Named("email", email))
	if err != nil {
		return fmt.Errorf("failed to update user: %v", err)
	}

	return nil
}
