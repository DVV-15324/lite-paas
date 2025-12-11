package storagesub

import (
	"context"

	entityStorageSub "lite-paas/services/entity/storage_sub"
)

func (s *StorageSubServiceSQL) ListStorageSubsAll(ctx context.Context) ([]*entityStorageSub.StorageSubscription, error) {
	query := `SELECT id, user_id, service_id, port_one, port_two, link_return, status, created_at, updated_at FROM user_storage`
	rows, err := s.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*entityStorageSub.StorageSubscription
	for rows.Next() {
		var sub entityStorageSub.StorageSubscription
		if err := rows.Scan(&sub.Id, &sub.UserId, &sub.ServiceId, &sub.PortOne, &sub.PortTwo, &sub.LinkReturn, &sub.Status, &sub.CreatedAt, &sub.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, &sub)
	}
	return list, nil
}
