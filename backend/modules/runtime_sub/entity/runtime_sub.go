package runtimesub

import (
	entityRuntime "lite-paas/modules/runtimes/entity"
	entityUser "lite-paas/modules/users/entity"
	"lite-paas/shared/uid"
	"time"
)

type RuntimeSubscription struct {
	Id            int64                         `json:"-" db:"id"`
	FakeId        string                        `json:"id" db:"-"`
	UserId        int64                         `json:"-" db:"user_id"`
	FakeUserId    string                        `json:"user_id" db:"-"`
	ServiceId     int64                         `json:"-" db:"service_id"`
	FakeServiceId string                        `json:"service_id" db:"-"`
	LinkGit       *string                       `json:"link_git" db:"link_git"`
	TokenGit      *string                       `json:"token_git,omitempty" db:"token_git"`
	InfoRunTime   *entityRuntime.RuntimeService `json:"info_runtime,omitempty"`
	InfoUser      *entityUser.Users             `json:"user" db:"-"`
	LinkReturn    *string                       `json:"link_return,omitempty" db:"link_return"`
	Status        bool                          `json:"status" db:"status"`
	CreatedAt     time.Time                     `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time                     `json:"updated_at" db:"updated_at"`
}

func (p *RuntimeSubscription) Mask() {
	if p.InfoRunTime != nil {
		p.InfoRunTime.Mask()
	}
	if p.InfoUser != nil {
		p.InfoUser.Mask()
	}
	uid_i := uid.NewUID(uint32(p.Id), 6).ToBase58()
	p.FakeId = uid_i

	uid_inv := uid.NewUID(uint32(p.UserId), 1).ToBase58()
	p.FakeUserId = uid_inv

	uid_svc := uid.NewUID(uint32(p.ServiceId), 2).ToBase58()
	p.FakeServiceId = uid_svc
}
