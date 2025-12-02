package user

import (
	"database/sql"
	uid "lite-paas/common/uid"
)

type Users struct {
	Id        int            `json:"-"`
	FakeId    string         `json:"id"`
	Name      string         `json:"name"`
	Phone     sql.NullString `json:"phone"`
	Role      string         `json:"role"`
	Address   sql.NullString `json:"address"`
	Email     string         `json:"email"`
	DeletedAt string         `json:"deleted_at"`
	CreatedAt string         `json:"created_at"`
	UpdatedAt string         `json:"updated_at"`
}

func (u *Users) Table() string {
	return "users"
}

func (u *Users) Mask() {
	uid := uid.NewUID(uint32(u.Id), 1).ToBase58()
	u.FakeId = uid
}
