package user

import (
	uid "lite-paas/shared/uid"
)

type Users struct {
	Id        int    `json:"-"`
	FakeId    string `json:"id"`
	Name      string `json:"name"`
	Role      string `json:"role"`
	Email     string `json:"email"`
	Banned    bool   `json:"banned"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

func (u *Users) Table() string {
	return "users"
}

func (u *Users) Mask() {
	uid := uid.NewUID(uint32(u.Id), 1).ToBase58()
	u.FakeId = uid
}
