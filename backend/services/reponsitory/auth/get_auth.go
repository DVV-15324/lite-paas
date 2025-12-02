package auth

import (
	"context"
	"database/sql"
	entity "lite-paas/services/entity/auth"
)

// Kiểm tra Auth tồn tại
func (a *AuthServiceSQL) GetAuthByEmail(ctx context.Context, email string) (*entity.Auth, error) {
	var data entity.Auth
	query := "SELECT email, password, user_id, salt, role FROM user_auth WHERE email = @email"
	err := a.db.QueryRowContext(ctx, query, sql.Named("email", email)).Scan(
		&data.Email,
		&data.Password,
		&data.UserId,
		&data.Salt,
		&data.Role,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &data, nil
}
