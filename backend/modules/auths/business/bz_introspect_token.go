package auth

import (
	"context"
	c_jwt "lite-paas/shared/jwt"
)

func (bz *BusinessAuth) BzIntrospectToken(ctx context.Context, accessToken string) (*c_jwt.JwtClaims, error) {
	claims, error := bz.jwt.ParseToken(ctx, accessToken)
	if error != nil {
		return nil, error
	}
	return claims, nil
}
