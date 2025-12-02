package user

import (
	"context"
	"database/sql"
	entity "lite-paas/services/entity/user"
)

// Tạo User
func (u *UserServiceSQL) CreateUser(cxt context.Context, user *entity.CreateUserForm) (int, error) {
	query := `INSERT INTO users(name, email)
			OUTPUT INSERTED.id
			values(@name, @email);`
	var uid int
	err := u.db.QueryRowContext(cxt, query,
		sql.Named("name", user.Name),
		sql.Named("email", user.Email),
	).Scan(&uid)
	if err != nil {
		return 0, err
	}
	return uid, nil
}
