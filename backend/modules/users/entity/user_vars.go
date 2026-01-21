package user

import "strings"

type CreateUserForm struct {
	Email string `json:"email"`
	Name  string `json:"name"`
}

func (c *CreateUserForm) Validate() error {
	c.Name = strings.TrimSpace(c.Name)

	c.Email = strings.TrimSpace(c.Email)
	//Checks
	err_email := CheckEmail(c.Email)
	if err_email != nil {
		return err_email
	}
	err_name := CheckName(c.Name)
	if err_name != nil {
		return err_name
	}
	return nil
}
