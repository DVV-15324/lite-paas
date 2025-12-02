package invoice

import (
	"lite-paas/common/uid"
	entityRuntime "lite-paas/services/entity/runtime"
	entityStorage "lite-paas/services/entity/storage"
	entityUser "lite-paas/services/entity/user"
	"time"
)

type Invoice struct {
	Id            int64                         `json:"-" db:"id"`
	FakeId        string                        `json:"id" db:"-"`
	UserId        int64                         `json:"-" db:"user_id"`
	FakeUserId    string                        `json:"user_id" db:"-"`
	InfoUser      *entityUser.Users             `json:"user" db:"-"`
	ServiceID     int64                         `json:"-" db:"service_id"`
	FakeServiceId string                        `json:"service_id" db:"-"`
	ServiceType   string                        `json:"service_type" db:"service_type"`
	Amount        float64                       `json:"amount" db:"amount"`
	Status        string                        `json:"status" db:"status"`
	InfoRunTime   *entityRuntime.RuntimeService `json:"info_runtime,omitempty"`
	InfoStorage   *entityStorage.StorageService `json:"info_storage,omitempty"`
	PaidAt        *time.Time                    `json:"paid_at,omitempty" db:"paid_at"`
	DueDate       *time.Time                    `json:"due_date,omitempty" db:"due_date"`
	CreatedAt     time.Time                     `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time                     `json:"updated_at" db:"updated_at"`
}

func (u *Invoice) Mask() {
	if u.InfoRunTime != nil {
		u.InfoRunTime.Mask()
	}
	if u.InfoUser != nil {
		u.InfoUser.Mask()
	}
	if u.InfoStorage != nil {
		u.InfoStorage.Mask()
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
