package runtimesub

import ()

type CreateRuntimeSubscription struct {
	Status bool `json:"status" db:"status"`
}

func (r *CreateRuntimeSubscription) Validate() error {

	// errDescription := CheckLinkReturn(r.LinkReturn)
	// if errDescription != nil {
	// 	return errDescription
	// }

	return nil
}

type UpdateRuntimeSubscription struct {
	LinkGit *string `json:"link_git" db:"link_git"`
	Token   *string `json:"token,omitempty" db:"token"`
	Status  bool    `json:"status" db:"status"`
}

func (r *UpdateRuntimeSubscription) Validate() error {
	errLinkGit := CheckLinkGit(*r.LinkGit)
	if errLinkGit != nil {
		return errLinkGit
	}

	errToken := CheckToken(*r.Token)
	if errToken != nil {
		return errToken
	}

	return nil
}
