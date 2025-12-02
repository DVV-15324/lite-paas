package auth

import (
	c_jwt "lite-paas/common/jwt"

	"context"
)

func (bz *BusinessAuth) BzIntrospectToken(ctx context.Context, accessToken string) (*c_jwt.JwtClaims, error) {
	claims, error := bz.jwt.ParseToken(ctx, accessToken)
	if error != nil {
		return nil, error
	}
	return claims, nil
}
