package database_sub

import (
	"context"
	"database/sql"
	"fmt"
	entityDatabaseSub "lite-paas/modules/database_sub/entity"
)

func (s *DatabaseSubServiceSQL) CreateDatabaseSub(
	ctx context.Context,
	sub *entityDatabaseSub.CreateDatabaseSub,
	user_id int64,
	service_id int64,
) (insertedID int64, port int, err error) {

	query := `
        INSERT INTO database_sub (user_id, service_id, port, name_login, password_login, link_return, status)
        OUTPUT INSERTED.id
        VALUES (@user_id, @service_id, @port, @name_login, @password_login, @link_return, @status)
    `

	err = s.db.QueryRowContext(ctx, query,
		sql.Named("user_id", user_id),
		sql.Named("service_id", service_id),
		sql.Named("port", 0), // tạm thời
		sql.Named("name_login", sub.UserName),
		sql.Named("password_login", sub.PassWord),
		sql.Named("link_return", sub.LinkReturn),
		sql.Named("status", sub.Status),
	).Scan(&insertedID)

	if err != nil {
		err = fmt.Errorf("failed to create database subscription: %v", err)
		return
	}

	port = int(insertedID) + 30000

	_, err = s.db.ExecContext(ctx, `
		UPDATE database_sub
		SET port = @port
		WHERE id = @id
	`,
		sql.Named("port", port),
		sql.Named("id", insertedID),
	)
	if err != nil {
		err = fmt.Errorf("failed to update ports: %v", err)
		return
	}

	return
}
