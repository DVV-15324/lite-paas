package invoice

import (
	entityDatabase "lite-paas/modules/database/entity"
	entityRuntime "lite-paas/modules/runtimes/entity"
	entityUser "lite-paas/modules/users/entity"
	"lite-paas/shared/uid"
	"time"
)

type Invoice struct {
	Id            int64                           `json:"-" db:"id"`
	FakeId        string                          `json:"id" db:"-"`
	UserId        int64                           `json:"-" db:"user_id"`
	FakeUserId    string                          `json:"user_id" db:"-"`
	InfoUser      *entityUser.Users               `json:"user" db:"-"`
	ServiceID     int64                           `json:"-" db:"service_id"`
	FakeServiceId string                          `json:"service_id" db:"-"`
	ServiceType   string                          `json:"service_type" db:"service_type"`
	Amount        float64                         `json:"amount" db:"amount"`
	Status        bool                            `json:"status" db:"status"`
	InfoRunTime   *entityRuntime.RuntimeService   `json:"info_runtime,omitempty"`
	InfoDatabase  *entityDatabase.DatabaseService `json:"info_database,omitempty"`
	DueDate       *time.Time                      `json:"due_date,omitempty" db:"due_date"`
	CreatedAt     time.Time                       `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time                       `json:"updated_at" db:"updated_at"`
}

func (u *Invoice) Mask() {
	if u.InfoRunTime != nil {
		u.InfoRunTime.Mask()
	}
	if u.InfoUser != nil {
		u.InfoUser.Mask()
	}
	if u.InfoDatabase != nil {
		u.InfoDatabase.Mask()
	}
	if u.ServiceType == "runtime" {
		u.FakeServiceId = uid.NewUID(uint32(u.ServiceID), 2).ToBase58()
	} else {
		u.FakeServiceId = uid.NewUID(uint32(u.ServiceID), 3).ToBase58()
	}

	uid_i := uid.NewUID(uint32(u.Id), 4).ToBase58()
	u.FakeId = uid_i

	uid_u := uid.NewUID(uint32(u.UserId), 1).ToBase58()
	u.FakeUserId = uid_u
}
