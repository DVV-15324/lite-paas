package supportticket

import (
	"lite-paas/common/uid"
	"time"
)

type SupportTicket struct {
	Id               int64     `json:"-" db:"id"`
	FakeId           string    `json:"id" db:"-"`
	UserID           int64     `json:"-" db:"user_id"`
	FakeUserID       string    `json:"user_id" db:"-"`
	ServiceSubID     int64     `json:"-" db:"service_sub_id"`
	FakeServiceSubID string    `json:"service_sub_id" db:"-"`
	ServiceType      string    `json:"service_type" db:"service_type"`
	Title            string    `json:"title" db:"title"`
	Content          string    `json:"content" db:"content"`
	Status           string    `json:"status" db:"status"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}

func (p *SupportTicket) Mask() {

	uid_i := uid.NewUID(uint32(p.Id), 8).ToBase58()
	p.FakeId = uid_i

	uid_inv := uid.NewUID(uint32(p.UserID), 1).ToBase58()
	p.FakeUserID = uid_inv
	if p.ServiceType == "runtime" {
		uid_svc := uid.NewUID(uint32(p.ServiceSubID), 7).ToBase58()
		p.FakeServiceSubID = uid_svc
	}
	if p.ServiceType == "storage" || p.ServiceType == "database" {
		uid_svc := uid.NewUID(uint32(p.ServiceSubID), 6).ToBase58()
		p.FakeServiceSubID = uid_svc
	}

}
