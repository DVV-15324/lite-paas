package runtimesub

import ()

type CreateRuntimeSubscription struct {
	Status bool `json:"status" db:"status"`
}

func (r *CreateRuntimeSubscription) Validate() error {

	return nil
}

type UpdateRuntimeSubscription struct {
	LinkGit  *string `json:"link_git" db:"link_git"`
	TokenGit *string `json:"token_git,omitempty" db:"token_git"`
}

func (r *UpdateRuntimeSubscription) Validate() error {
	// errLinkGit := CheckLinkGit(*r.LinkGit)
	// if errLinkGit != nil {
	// 	return errLinkGit
	// }

	// errToken := CheckToken(*r.TokenGit)
	// if errToken != nil {
	// 	return errToken
	// }

	return nil
}
