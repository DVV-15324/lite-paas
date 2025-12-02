package user

import "strings"

type CreateUserForm struct {
	Email string `json:"email"`
	Name  string `json:"first_name"`
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

type UpdateUserForm struct {
	Name    *string `json:"name"`
	Phone   *string `json:"phone"`
	Address *string `json:"address"`
}

func (c *UpdateUserForm) Validate() error {
	if c.Name != nil {
		*c.Name = strings.TrimSpace(*c.Name)
		if err := CheckName(*c.Name); err != nil {
			return err
		}
	}
	if c.Address != nil {
		*c.Address = strings.TrimSpace(*c.Address)
		if err := CheckAddress(*c.Address); err != nil {
			return err
		}
	}
	if c.Phone != nil {
		*c.Phone = strings.TrimSpace(*c.Phone)
		if err := CheckPhone(*c.Phone); err != nil {
			return err
		}
	}

	return nil
}
