package ticketmessage

import (
	"lite-paas/common/uid"

	"time"
)

type TicketMessage struct {
	Id           int64     `json:"-" db:"id"`
	FakeId       string    `json:"id" db:"-"`
	FakeSenderID string    `json:"sender_id" db:"-"`
	SenderID     int64     `json:"-" db:"sender_id"`
	TicketID     int64     `json:"-" db:"ticket_id"`
	FakeTicketID string    `json:"ticket_id" db:"-"`
	Message      string    `json:"message" db:"message"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

func (p *TicketMessage) Mask() {

	uid_i := uid.NewUID(uint32(p.Id), 9).ToBase58()
	p.FakeId = uid_i

	uid_sender := uid.NewUID(uint32(p.SenderID), 1).ToBase58()
	p.FakeSenderID = uid_sender

	uid_tick := uid.NewUID(uint32(p.TicketID), 8).ToBase58()
	p.FakeTicketID = uid_tick
}
