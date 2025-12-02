package supportticket

type CreateSupportTicket struct {
	ServiceType string  `json:"service_type" db:"service_type"`
	Title       string  `json:"title" db:"title"`
	Content     string  `json:"content" db:"content"`
	Image       *string `json:"image,omitempty" db:"image"`
	Priority    string  `json:"priority" db:"priority"`
	Status      string  `json:"status" db:"status"`
}

type UpdateSupportTicket struct {
	ServiceType *string `json:"service_type,omitempty" db:"service_type"`
	Title       *string `json:"title,omitempty" db:"title"`
	Content     *string `json:"content,omitempty" db:"content"`
	Image       *string `json:"image,omitempty" db:"image"`
	Priority    *string `json:"priority,omitempty" db:"priority"`
	Status      *string `json:"status,omitempty" db:"status"`
}

func (c *CreateSupportTicket) Validate() error {
	if err := CheckServiceType(c.ServiceType); err != nil {
		return err
	}
	if err := CheckTitle(c.Title); err != nil {
		return err
	}
	if err := CheckContent(c.Content); err != nil {
		return err
	}

	if err := CheckStatus(c.Status); err != nil {
		return err
	}
	return nil
}

func (u *UpdateSupportTicket) Validate() error {
	if u.ServiceType != nil {
		if err := CheckServiceType(*u.ServiceType); err != nil {
			return err
		}
	}
	if u.Title != nil {
		if err := CheckTitle(*u.Title); err != nil {
			return err
		}
	}
	if u.Content != nil {
		if err := CheckContent(*u.Content); err != nil {
			return err
		}
	}
	if u.Priority != nil {
		if err := CheckPriority(*u.Priority); err != nil {
			return err
		}
	}
	if u.Status != nil {
		if err := CheckStatus(*u.Status); err != nil {
			return err
		}
	}
	return nil
}
