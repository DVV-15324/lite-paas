package user

import (
	"context"
	"database/sql"
	"fmt"
	entity "lite-paas/services/entity/user"
	"strings"
)

func (u *UserServiceSQL) UpdateUser(cxt context.Context, user *entity.UpdateUserForm, id int) error {
	if user == nil {
		return fmt.Errorf("user is nil")
	}

	var (
		placeholders []string
		args         []interface{}
	)

	if user.Name != nil {
		placeholders = append(placeholders, "name = @name")
		args = append(args, sql.Named("first_name", *user.Name))
	}
	if user.Phone != nil {
		placeholders = append(placeholders, "phone = @phone")
		args = append(args, sql.Named("phone", *user.Phone))
	}
	if user.Address != nil {
		placeholders = append(placeholders, "address = @address")
		args = append(args, sql.Named("address", *user.Address))
	}

	if len(placeholders) == 0 {
		return fmt.Errorf("no fields to update")
	}

	query := fmt.Sprintf("UPDATE users SET %s WHERE id = @id", strings.Join(placeholders, ", "))

	args = append(args, sql.Named("id", id))

	_, err := u.db.ExecContext(cxt, query, args...)
	if err != nil {
		return fmt.Errorf("failed to update user: %v", err)
	}

	return nil
}
