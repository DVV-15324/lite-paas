package storagesub

import (
	"context"
	"database/sql"
	"fmt"
	entityStorageSub "lite-paas/services/entity/storage_sub"
)

func (s *StorageSubServiceSQL) CreateStorageSub(
	ctx context.Context,
	sub *entityStorageSub.CreateStorageSubscription,
	user_id int64,
	service_id int64,
	needPortTwo bool,
) (insertedID int64, portOne int, portTwo int, err error) {

	// 1. Insert tạm thời port_one và port_two = 0
	query := `
        INSERT INTO user_storage (user_id, service_id, port_one, port_two, name_login, password_login, link_return, status)
        OUTPUT INSERTED.id
        VALUES (@user_id, @service_id, @port_one, @port_two, @name_login, @password_login, @link_return, @status)
    `

	err = s.db.QueryRowContext(ctx, query,
		sql.Named("user_id", user_id),
		sql.Named("service_id", service_id),
		sql.Named("port_one", 0), // tạm thời
		sql.Named("port_two", 0), // tạm thời
		sql.Named("name_login", sub.UserName),
		sql.Named("password_login", sub.PassWord),
		sql.Named("link_return", sub.LinkReturn),
		sql.Named("status", sub.Status),
	).Scan(&insertedID)

	if err != nil {
		err = fmt.Errorf("failed to create storage subscription: %v", err)
		return
	}

	// 2. Cập nhật port
	portOne = int(insertedID) + 30000
	if needPortTwo {
		portTwo = int(insertedID) + 31000
	} else {
		portTwo = 0
	}

	_, err = s.db.ExecContext(ctx, `
		UPDATE user_storage
		SET port_one = @port_one, port_two = @port_two
		WHERE id = @id
	`,
		sql.Named("port_one", portOne),
		sql.Named("port_two", portTwo),
		sql.Named("id", insertedID),
	)
	if err != nil {
		err = fmt.Errorf("failed to update ports: %v", err)
		return
	}

	return
}
