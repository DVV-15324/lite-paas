package auth

import (
	"context"
	"database/sql"
	"fmt"
)

func (u *AuthServiceSQL) UpdateAuthStatus(cxt context.Context, email string, status int) error {

	query := "UPDATE user_auth SET status=@status WHERE email = @email"

	_, err := u.db.ExecContext(cxt, query, sql.Named("status", status), sql.Named("email", email))
	if err != nil {
		return fmt.Errorf("failed to update user: %v", err)
	}

	return nil
}
