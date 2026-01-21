package auth

import (
	"context"
	"database/sql"
	entity "lite-paas/modules/auths/entity"
)

// Kiểm tra Auth tồn tại
func (a *AuthServiceSQL) GetAuthByEmail(ctx context.Context, email string) (*entity.Auth, error) {
	var data entity.Auth
	query := "SELECT email, password, user_id, salt, role, banned FROM auths WHERE email = @email"
	err := a.db.QueryRowContext(ctx, query, sql.Named("email", email)).Scan(
		&data.Email,
		&data.Password,
		&data.UserId,
		&data.Salt,
		&data.Role,
		&data.Banned,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &data, nil
}
