package storagesub

type CreateStorageSubscription struct {
	LinkReturn string `json:"link_return" db:"link_return"`
	UserName   string `json:"name_login" db:"name_login"`
	PassWord   string `json:"password_login" db:"password_login"`
	Status     bool   `json:"status" db:"status"`
	// PortOne    int    `json:"port_one" db:"port_one"`
	// PortTwo    int    `json:"port_two" db:"port_two"`
}

func (s *CreateStorageSubscription) Validate() error {
	// if err := checkLinkReturn(s.LinkReturn); err != nil {
	// 	return err
	// }
	if err := checkUsername(s.UserName); err != nil {
		return err
	}
	if err := checkPassword(s.PassWord); err != nil {
		return err
	}

	return nil
}

type UpdateStorageSubscription struct {
	LinkReturn *string `json:"link_return,omitempty" db:"link_return"`
	UserName   *string `json:"user_name,omitempty" db:"user_name"`
	PassWord   *string `json:"password,omitempty" db:"password"`
	Port       *string `json:"port,omitempty" db:"port"`
	Status     bool    `json:"status" db:"status"`
}

func (s *UpdateStorageSubscription) Validate() error {
	// if s.LinkReturn != nil {
	// 	if err := checkLinkReturn(*s.LinkReturn); err != nil {
	// 		return err
	// 	}
	// }
	if s.UserName != nil {
		if err := checkUsername(*s.UserName); err != nil {
			return err
		}
	}
	if s.PassWord != nil {
		if err := checkPassword(*s.PassWord); err != nil {
			return err
		}
	}
	if s.Port != nil {
		if err := checkPort(*s.Port); err != nil {
			return err
		}
	}
	return nil
}
