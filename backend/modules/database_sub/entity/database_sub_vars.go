package database_sub

type CreateDatabaseSub struct {
	LinkReturn string `json:"link_return" db:"link_return"`
	UserName   string `json:"name_login" db:"name_login"`
	PassWord   string `json:"password_login" db:"password_login"`
	Status     bool   `json:"status" db:"status"`
	Port       int    `json:"port" db:"port"`
}

func (s *CreateDatabaseSub) Validate() error {
	if err := checkUsername(s.UserName); err != nil {
		return err
	}
	if err := checkPassword(s.PassWord); err != nil {
		return err
	}

	return nil
}

type UpdateDatabaseSub struct {
	Status bool `json:"status" db:"status"`
}

func (s *UpdateDatabaseSub) Validate() error {
	return nil
}
