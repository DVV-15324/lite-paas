package runtimesub

import (
	"context"
	"database/sql"
	"fmt"
	"lite-paas/common/uid"
	c_utils "lite-paas/common/utils"
	entityRuntimeSub "lite-paas/services/entity/runtime_sub"
	"strings"
)

func (s *RuntimeSubServiceSQL) CreateRuntimeSub(ctx context.Context, sub *entityRuntimeSub.CreateRuntimeSubscription, userName string, user_id int64, service_id int64) (int64, error) {
	// 1. Insert bản ghi với link_return tạm thời null hoặc rỗng
	queryInsert := `
    INSERT INTO user_runtime (user_id, service_id, link_return, status)
    OUTPUT INSERTED.id
    VALUES (@user_id, @service_id, '', @status);
`
	var id int64
	err := s.db.QueryRowContext(ctx, queryInsert,
		sql.Named("user_id", user_id),
		sql.Named("service_id", service_id),
		sql.Named("status", sub.Status),
	).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("failed to create runtime subscription: %v", err)
	}

	// 2. Tạo link_return = name + id
	uid_i := uid.NewUID(uint32(id), 6).ToBase58()
	linkReturn := fmt.Sprintf("%s-%s.example.com", strings.ReplaceAll(strings.ToLower(userName), " ", ""), uid_i)
	linkReturn = c_utils.SanitizeK8sName(linkReturn)
	// 3. Update lại bản ghi
	queryUpdate := `
    UPDATE user_runtime
    SET link_return = @link_return
    WHERE id = @id
`
	_, err = s.db.ExecContext(ctx, queryUpdate,
		sql.Named("link_return", linkReturn),
		sql.Named("id", id),
	)
	if err != nil {
		return 0, fmt.Errorf("failed to update link_return: %v", err)
	}

	return id, nil

}
