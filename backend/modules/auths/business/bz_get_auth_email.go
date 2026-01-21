package auth

import (
	"context"
	entityAuth "lite-paas/modules/auths/entity"
)

func (bz *BusinessAuth) BzGetAuthByEmail(ctx context.Context, email string) (*entityAuth.Auth, error) {
	return bz.bzAuth.GetAuthByEmail(ctx, email)
}
