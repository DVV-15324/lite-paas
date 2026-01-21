package storage

import (
	"lite-paas/shared/uid"
	"time"
)

type DatabaseService struct {
	Id            int64     `json:"-" db:"id"`
	FakeId        string    `json:"id" db:"-"`
	Name          string    `json:"name" db:"name"`
	Price         float64   `json:"price" db:"price"`
	CPU           float64   `json:"cpu"`
	RAM           int       `json:"ram"`
	Storage       int       `json:"storage"`
	Description   *string   `json:"description,omitempty" db:"description"`
	Version       *string   `json:"version,omitempty" db:"version"`
	Status        bool      `json:"status" db:"status"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time `json:"updated_at" db:"updated_at"`
	PortContainer int       `json:"port_container" db:"port_container"`
}

func (u *DatabaseService) Mask() {
	uid := uid.NewUID(uint32(u.Id), 3).ToBase58()
	u.FakeId = uid
}
