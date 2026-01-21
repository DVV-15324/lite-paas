package database_sub

import (
	entityDatabase "lite-paas/modules/database/entity"
	entityUser "lite-paas/modules/users/entity"
	"lite-paas/shared/uid"
	"time"
)

type DatabaseSub struct {
	Id            int64                           `json:"-" db:"Id"`
	FakeId        string                          `json:"Id" db:"-"`
	UserId        int64                           `json:"-" db:"user_Id"`
	FakeUserId    string                          `json:"user_Id" db:"-"`
	ServiceId     int64                           `json:"-" db:"service_Id"`
	FakeServiceId string                          `json:"service_Id" db:"-"`
	LinkReturn    string                          `json:"link_return,omitempty" db:"link_return"`
	NameLogin     string                          `json:"name_login,omitempty" db:"name_logim"`
	PassWordLogin string                          `json:"password_login,omitempty" db:"password_login"`
	Port          string                          `json:"port,omitempty" db:"port"`
	InfoDatabase  *entityDatabase.DatabaseService `json:"info_database,omitempty"`
	InfoUser      *entityUser.Users               `json:"user" db:"-"`
	Status        bool                            `json:"status" db:"status"`
	CreatedAt     time.Time                       `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time                       `json:"updated_at" db:"updated_at"`
}

func (p *DatabaseSub) Mask() {
	if p.InfoDatabase != nil {
		p.InfoDatabase.Mask()
	}
	if p.InfoUser != nil {
		p.InfoUser.Mask()
	}
	uid_i := uid.NewUID(uint32(p.Id), 7).ToBase58()
	p.FakeId = uid_i

	uid_inv := uid.NewUID(uint32(p.UserId), 1).ToBase58()
	p.FakeUserId = uid_inv

	uid_svc := uid.NewUID(uint32(p.ServiceId), 3).ToBase58()
	p.FakeServiceId = uid_svc
}
