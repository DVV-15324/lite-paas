package user

import (
	"context"

	entity "lite-paas/services/entity/user"
)

// GetUserAll lấy tất cả user
func (u *UserServiceSQL) GetUserAll(ctx context.Context) ([]*entity.Users, error) {
	query := `SELECT 
		u.id, 
		u.name, 
		u.phone, 
		u.address, 
		u.email,
		a.role
	FROM users u
	LEFT JOIN user_auth a ON u.id = a.user_id
	`

	rows, err := u.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*entity.Users

	for rows.Next() {
		var data entity.Users
		err := rows.Scan(&data.Id, &data.Name, &data.Phone, &data.Address, &data.Email, &data.Role)
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
