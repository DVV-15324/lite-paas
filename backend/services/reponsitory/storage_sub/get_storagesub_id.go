package storagesub

import (
	"context"
	"database/sql"
	entityStorageSub "lite-paas/services/entity/storage_sub"
)

func (s *StorageSubServiceSQL) GetStorageSubsById(ctx context.Context, id int64) (*entityStorageSub.StorageSubscription, error) {
	query := `SELECT id, user_id, service_id, name_login, password_login, port_one, port_two, link_return, status, created_at, updated_at FROM user_storage_sub WHERE id=@id`
	rows := s.db.QueryRowContext(ctx, query, sql.Named("id", id))

	var sub entityStorageSub.StorageSubscription
	if err := rows.Scan(&sub.Id, &sub.UserId, &sub.ServiceId, &sub.NameLogin, &sub.PassWordLogin, &sub.PortOne, &sub.PortTwo, &sub.LinkReturn, &sub.Status, &sub.CreatedAt, &sub.UpdatedAt); err != nil {
		return nil, err
	}

	return &sub, nil
}
