package auth

import (
	"context"
	"database/sql"
	entity "lite-paas/services/entity/auth"
)

// tạo auth
func (u *AuthServiceSQL) CreateAuth(cxt context.Context, auth *entity.Auth) error {
	query := `INSERT INTO user_auth(salt, email, password, user_id, role)
			OUTPUT INSERTED.id
			values(@salt, @email, @password, @user_id, @role);`
	_, err := u.db.ExecContext(cxt, query,
		sql.Named("salt", auth.Salt),
		sql.Named("email", auth.Email),
		sql.Named("password", auth.Password),
		sql.Named("user_id", auth.UserId),
		sql.Named("role", "user"),
	)
	if err != nil {
		return err
	}
	return nil
}
