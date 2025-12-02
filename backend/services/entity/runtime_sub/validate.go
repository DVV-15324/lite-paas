package runtimesub

func CheckLinkGit(link_git string) error {
	if len(link_git) <= 0 {
		return ErrRuntimeSubNotValidLinkGit
	}
	return nil
}
func CheckToken(token string) error {
	if len(token) <= 0 {
		return ErrRuntimeSubNotValidToken
	}
	return nil
}
func CheckLinkReturn(link_return string) error {
	if len(link_return) <= 0 {
		return ErrorRuntimeSubNotValidLinkReturn
	}
	return nil
}
