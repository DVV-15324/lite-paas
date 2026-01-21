package user

import (
	"context"
	"database/sql"
	entity "lite-paas/modules/users/entity"
)

// Tạo User
func (u *UserServiceSQL) CreateUser(cxt context.Context, user *entity.CreateUserForm) (int, error) {
	query := `INSERT INTO users(name, email, role)
			OUTPUT INSERTED.id
			values(@name, @email, @role);`
	var uid int
	err := u.db.QueryRowContext(cxt, query,
		sql.Named("name", user.Name),
		sql.Named("email", user.Email),
		sql.Named("role", "user"),
	).Scan(&uid)
	if err != nil {
		return 0, err
	}
	return uid, nil
}
