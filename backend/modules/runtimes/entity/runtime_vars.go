package runtime

import ()

type CreateRuntime struct {
	Name        string  `json:"name" db:"name"`
	Price       float64 `json:"price" db:"price"`
	Description string  `json:"description" db:"description"`
	Version     string  `json:"version" db:"version"`
	RAM         int     `json:"ram" db:"ram"`
	CPU         float64 `json:"cpu" db:"cpu"`
	Storage     int     `json:"storage" db:"storage"`
	Status      bool    `json:"status" db:"status"`
}

func (r *CreateRuntime) Validate() error {
	errName := CheckName(r.Name)
	if errName != nil {
		return errName
	}

	errPrice := CheckPrice(r.Price)
	if errPrice != nil {
		return errPrice
	}

	errDescription := CheckDescription(r.Description)
	if errDescription != nil {
		return errDescription
	}

	errVersion := CheckVersion(r.Version)
	if errVersion != nil {
		return errVersion
	}

	return nil
}

type UpdateRuntime struct {
	Status *bool `json:"status" db:"status"`
}
