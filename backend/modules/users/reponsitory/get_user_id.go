package user

import (
	"context"
	"database/sql"
	entity "lite-paas/modules/users/entity"
)

// thông tin user
func (u *UserServiceSQL) GetUserById(ctx context.Context, id int) (*entity.Users, error) {
	var data entity.Users
	query := `SELECT 
		u.id, 
		u.name, 
		u.email,
		u.role
	FROM users u
	WHERE u.id = @id
`
	row := u.db.QueryRowContext(ctx, query, sql.Named("id", id))
	err := row.Scan(&data.Id, &data.Name, &data.Email, &data.Role)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &data, nil
}
