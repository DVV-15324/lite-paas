package storage

type CreateStorageService struct {
	Name        string  `json:"name" db:"name"`
	Price       float64 `json:"price" db:"price"`
	Description *string `json:"description,omitempty" db:"description"`
	CPU         float64 `json:"cpu"`
	RAM         int     `json:"ram"`
	Storage     int     `json:"storage"`
	Version     *string `json:"version,omitempty" db:"version"`
	Status      bool    `json:"status" db:"status"`
	ServiceType string  `json:"service_type" db:"service_type"`
}

func (s *CreateStorageService) Validate() error {
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

type UpdateStorageService struct {
	Name        *string  `json:"name,omitempty" db:"name"`
	Price       *float64 `json:"price,omitempty" db:"price"`
	Description *string  `json:"description,omitempty" db:"description"`
	Version     *string  `json:"version,omitempty" db:"version"`
	Status      *bool    `json:"status" db:"status"`
	CPU         *float64 `json:"cpu"`
	RAM         *int     `json:"ram"`
	Storage     *int     `json:"storage"`
	ServiceType *string  `json:"service_type" db:"service_type"`
}

func (s *UpdateStorageService) Validate() error {
	if s.Name != nil {
		if err := CheckName(*s.Name); err != nil {
			return err
		}
	}
	if s.Price != nil {
		if err := CheckPrice(*s.Price); err != nil {
			return err
		}
	}
	if s.Description != nil {
		if err := CheckDescription(*s.Description); err != nil {
			return err
		}
	}
	return nil
}
