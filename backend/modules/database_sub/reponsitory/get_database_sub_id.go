package database_sub

import (
	"context"
	"database/sql"
	entityDatabaseSub "lite-paas/modules/database_sub/entity"
)

func (s *DatabaseSubServiceSQL) GetDatabaseSubsById(ctx context.Context, id int64) (*entityDatabaseSub.DatabaseSub, error) {
	query := `SELECT id, user_id, service_id, name_login, password_login, port, link_return, status, created_at, updated_at FROM database_sub WHERE id=@id`
	rows := s.db.QueryRowContext(ctx, query, sql.Named("id", id))

	var sub entityDatabaseSub.DatabaseSub
	if err := rows.Scan(&sub.Id, &sub.UserId, &sub.ServiceId, &sub.NameLogin, &sub.PassWordLogin, &sub.Port, &sub.LinkReturn, &sub.Status, &sub.CreatedAt, &sub.UpdatedAt); err != nil {
		return nil, err
	}

	return &sub, nil
}
