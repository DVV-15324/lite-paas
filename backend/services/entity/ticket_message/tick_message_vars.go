package ticketmessage

type CreateTicketMessage struct {
	Message string `json:"message" db:"message"`
}

type UpdateTicketMessage struct {
	Message *string `json:"message,omitempty" db:"message"`
}

func (c *CreateTicketMessage) Validate() error {
	if err := CheckMessage(c.Message); err != nil {
		return err
	}

	return nil
}

func (u *UpdateTicketMessage) Validate() error {
	if u.Message != nil {
		if err := CheckMessage(*u.Message); err != nil {
			return err
		}
	}

	return nil
}
