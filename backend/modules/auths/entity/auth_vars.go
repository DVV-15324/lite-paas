package auth

import "strings"

type RegisterForm struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (r *RegisterForm) Validate() error {
	r.Email = strings.TrimSpace(r.Email)
	r.Password = strings.TrimSpace(r.Password)
	r.Name = strings.TrimSpace(r.Name)
	err_email := CheckEmail(r.Email)
	if err_email != nil {
		return err_email
	}
	err_password := CheckPasword(r.Password)
	if err_password != nil {
		return err_password
	}
	err_name := CheckName(r.Name)
	if err_name != nil {
		return err_name
	}
	return nil
}

type LoginForm struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (r *LoginForm) Validate() error {
	r.Email = strings.TrimSpace(r.Email)
	r.Password = strings.TrimSpace(r.Password)
	err_email := CheckEmail(r.Email)
	if err_email != nil {
		return err_email
	}
	err_password := CheckPasword(r.Password)
	if err_password != nil {
		return err_password
	}
	return nil
}
