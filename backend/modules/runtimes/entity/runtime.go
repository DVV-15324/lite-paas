package runtime

import (
	"lite-paas/shared/uid"
	"time"
)

type RuntimeService struct {
	Id          int64     `json:"-" db:"id"`
	FakeId      string    `json:"id" db:"-"`
	Name        string    `json:"name" db:"name"`
	Price       float64   `json:"price" db:"price"`
	CPU         float64   `json:"cpu"`
	RAM         int       `json:"ram"`
	Storage     int       `json:"storage"`
	Description string    `json:"description" db:"description"`
	Version     string    `json:"version" db:"version"`
	Status      bool      `json:"status" db:"status"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

func (u *RuntimeService) Mask() {
	uid := uid.NewUID(uint32(u.Id), 2).ToBase58()
	u.FakeId = uid
}
