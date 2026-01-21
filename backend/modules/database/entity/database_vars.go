package storage

type CreateDatabaseService struct {
	Name          string  `json:"name" db:"name"`
	Price         float64 `json:"price" db:"price"`
	Description   *string `json:"description,omitempty" db:"description"`
	CPU           float64 `json:"cpu"`
	RAM           int     `json:"ram"`
	Storage       int     `json:"storage"`
	Version       *string `json:"version,omitempty" db:"version"`
	Status        bool    `json:"status" db:"status"`
	PortContainer int     `json:"port_container" db:"port_container"`
}

func (s *CreateDatabaseService) Validate() error {
	if err := CheckName(s.Name); err != nil {
		return err
	}
	if err := CheckPrice(s.Price); err != nil {
		return err
	}
	if s.Description != nil {
		if err := CheckDescription(*s.Description); err != nil {
			return err
		}
	}
	return nil
}

type UpdateDatabaseService struct {
	Status *bool `json:"status" db:"status"`
}

func (s *UpdateDatabaseService) Validate() error {

	return nil
}
