package database_sub

import (
	"context"
	entityDatabaseSub "lite-paas/modules/database_sub/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (b *BussinessDatabaseSub) BzGetDatabaseSubsByUser(ctx context.Context, userID int64) ([]*entityDatabaseSub.DatabaseSub, *c_errors.AppError) {
	databaseList, err := b.bz.ListDatabaseSubsByUser(ctx, userID)
	if err != nil {
		app := c_errors.NewAppError(404, http.StatusText(404), err)
		return nil, app
	}
	for i := 0; i < len(databaseList); i++ {
		userInfo, _ := b.bzUser.BzGetUsersById(ctx, int(databaseList[i].UserId))
		databaseList[i].InfoUser = userInfo

		databaseInfo, _ := b.bzDatabase.BzGetDatabaseById(ctx, int(databaseList[i].ServiceId))
		databaseList[i].InfoDatabase = databaseInfo
	}
	return databaseList, nil

}
