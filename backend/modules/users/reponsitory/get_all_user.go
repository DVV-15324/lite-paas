package user

import (
	"context"

	entity "lite-paas/modules/users/entity"
)

// GetUserAll lấy tất cả user
func (u *UserServiceSQL) GetUserAll(ctx context.Context) ([]*entity.Users, error) {
	query := `SELECT 
		u.id, 
		u.name,
		u.email,
		u.role,
		a.banned
	FROM users u
	LEFT JOIN auths a ON a.user_id = u.id`

	rows, err := u.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*entity.Users

	for rows.Next() {
		var data entity.Users
		err := rows.Scan(&data.Id, &data.Name, &data.Email, &data.Role, &data.Banned)
		if err != nil {
			return nil, err
		}
		users = append(users, &data)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}
