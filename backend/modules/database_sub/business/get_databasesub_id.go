package database_sub

import (
	"context"
	entityDatabaseSub "lite-paas/modules/database_sub/entity"
	c_errors "lite-paas/shared/errors"
	"net/http"
)

func (b *BussinessDatabaseSub) BzGetDatabaseSubsById(ctx context.Context, id int64, userId int64) (*entityDatabaseSub.DatabaseSub, *c_errors.AppError) {
	database, err := b.bz.GetDatabaseSubsById(ctx, id)
	if err != nil {
		app := c_errors.NewAppError(404, http.StatusText(404), err)
		return nil, app
	}
	userInfo, _ := b.bzUser.BzGetUsersById(ctx, int(database.UserId))
	database.InfoUser = userInfo
	databaseInfo, _ := b.bzDatabase.BzGetDatabaseById(ctx, int(database.ServiceId))
	database.InfoDatabase = databaseInfo

	return database, nil
}
