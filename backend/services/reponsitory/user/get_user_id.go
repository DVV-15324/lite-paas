package user

import (
	"context"
	"database/sql"
	entity "lite-paas/services/entity/user"
)

// thông tin user
func (u *UserServiceSQL) GetUserById(ctx context.Context, id int) (*entity.Users, error) {
	var data entity.Users
	query := `SELECT 
		u.id, 
		u.name, 
		u.phone, 
		u.address, 
		u.email,
		a.role
	FROM users u
	JOIN user_auth a ON a.user_id = u.id
	WHERE u.id = @id
`
	row := u.db.QueryRowContext(ctx, query, sql.Named("id", id))
	err := row.Scan(&data.Id, &data.Name, &data.Phone, &data.Address, &data.Email, &data.Role)
	if err != nil {
		return nil, err
	}
	return &data, nil
}
