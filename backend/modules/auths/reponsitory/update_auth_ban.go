package auth

import (
	"context"
	"database/sql"
	"fmt"
)

func (u *AuthServiceSQL) UpdateAuthBanned(cxt context.Context, email string, banned int) error {

	query := "UPDATE auths SET banned=@banned WHERE email = @email"

	_, err := u.db.ExecContext(cxt, query, sql.Named("banned", banned), sql.Named("email", email))
	if err != nil {
		return fmt.Errorf("failed to update banned auth: %v", err)
	}

	return nil
}
