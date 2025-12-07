package auth

import "strings"

type RegisterForm struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Phone    string `json:"phone"`
}

func (r *RegisterForm) Validate() error {
	r.Email = strings.TrimSpace(r.Email)
	r.Password = strings.TrimSpace(r.Password)
	r.Name = strings.TrimSpace(r.Name)
	r.Phone = strings.TrimSpace(r.Phone)

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

type ForgotPasswordForm struct {
	Email string `json:"email"`
}

func (f *ForgotPasswordForm) Validate() error {
	f.Email = strings.TrimSpace(f.Email)
	err_email := CheckEmail(f.Email)
	if err_email != nil {
		return err_email
	}
	return nil
}

type ChangePasswordForm struct {
	NewPassword string `json:"new_password"`
}

func (r *ChangePasswordForm) Validate() error {

	r.NewPassword = strings.TrimSpace(r.NewPassword)

	err_password := CheckPasword(r.NewPassword)
	if err_password != nil {
		return err_password
	}

	return nil
}

type GoogleLoginForm struct {
	AccessToken string `json:"access_token"`
}
