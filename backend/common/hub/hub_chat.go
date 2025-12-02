package hub

import (
	"context"
	"encoding/json"
	"fmt"
	connectdb "lite-paas/common/DB"
	c_ctx "lite-paas/common/ctx" // Thêm import này
	c_uid "lite-paas/common/uid"
	bzTicketMessage "lite-paas/services/business/ticket_message"
	entityTicketMessage "lite-paas/services/entity/ticket_message"
	responsitoryTicketMessage "lite-paas/services/reponsitory/ticket_message"

	"log"
	"net/http"

	"time"

	"github.com/gorilla/websocket"
	"github.com/nsqio/go-nsq"
)

type TicketClient struct {
	Conn     *websocket.Conn
	Send     chan []byte
	TicketId string
	UserID   string
}

type TicketHub struct {
	Clients    map[*TicketClient]bool
	Broadcast  chan []byte
	Register   chan *TicketClient
	Unregister chan *TicketClient
	Producer   *nsq.Producer
}

func NewTicketHub() *TicketHub {
	h := &TicketHub{
		Clients:    make(map[*TicketClient]bool),
		Broadcast:  make(chan []byte),
		Register:   make(chan *TicketClient),
		Unregister: make(chan *TicketClient),
	}
	h.initNSQProducer()
	go h.startNSQConsumer()
	go h.Run() // Chạy hub
	return h
}

func (h *TicketHub) initNSQProducer() {
	config := nsq.NewConfig()
	var err error
	h.Producer, err = nsq.NewProducer("localhost:4150", config)
	if err != nil {
		log.Printf("Failed to create NSQ producer: %v", err)
	}
	err = h.Producer.Ping()
	if err != nil {
		log.Printf("NSQ producer ping failed: %v", err)
	}
	log.Println("NSQ Producer connected successfully")
}

func (h *TicketHub) startNSQConsumer() {
	config := nsq.NewConfig()

	consumer, err := nsq.NewConsumer("chat_messages", "websocket", config)
	if err != nil {
		log.Fatal("Failed to create NSQ consumer:", err)
	}

	consumer.AddHandler(nsq.HandlerFunc(func(m *nsq.Message) error {
		log.Printf("Received from NSQ: %s", string(m.Body))
		var msg entityTicketMessage.TicketMessage
		if err := json.Unmarshal(m.Body, &msg); err != nil {
			return err
		}

		// Lưu message vào DB
		db, err := connectdb.Connectdb()
		if err != nil {
			log.Printf("Database connection error: %v", err)
			return err
		}
		rTicketMessage := responsitoryTicketMessage.NewTicketReplyServiceSQL(db)

		bz := bzTicketMessage.NewBussinessTickMessage(rTicketMessage)
		fmt.Println()
		msg.TicketID = int64(c_uid.DecodeFromBase58(msg.FakeTicketID).LocalID)
		msg.SenderID = int64(c_uid.DecodeFromBase58(msg.FakeSenderID).LocalID)

		err = bz.CreateNewMessage(context.Background(), &entityTicketMessage.CreateTicketMessage{
			Message: msg.Message,
		}, int(msg.TicketID), int(msg.SenderID))
		if err != nil {
			log.Printf("Error saving message to DB: %v", err)
			return err
		}

		// Broadcast message đến clients
		h.Broadcast <- m.Body
		return nil
	}))

	err = consumer.ConnectToNSQD("localhost:4150")
	if err != nil {
		log.Printf("Direct NSQD connection failed: %v. Trying lookupd...", err)
		err = consumer.ConnectToNSQLookupd("localhost:4161")
		if err != nil {
			log.Printf("Lookupd connection also failed: %v", err)
			return
		}
		log.Println("NSQ Consumer connected via lookupd")
	} else {
		log.Println("NSQ Consumer connected directly to NSQD")
	}

	// Giữ consumer chạy
	select {}
}

func (h *TicketHub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Clients[client] = true

		case client := <-h.Unregister:
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)
				close(client.Send)

			}

		case raw := <-h.Broadcast:
			var msg entityTicketMessage.TicketMessage

			if err := json.Unmarshal(raw, &msg); err != nil {
				log.Printf("Error unmarshaling broadcast message: %v", err)
				continue
			}

			for client := range h.Clients {
				if client.TicketId == msg.FakeTicketID {
					select {
					case client.Send <- raw:
						// Message sent
					default:
						// Channel full, unregister client
						close(client.Send)
						delete(h.Clients, client)
					}
				}
			}
		}
	}
}
func (h *TicketHub) HandleTicketWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Ticket WS upgrade error:", err)
		return
	}

	ticketID := r.URL.Query().Get("ticket")

	// Lấy context từ request
	ctx := r.Context()
	requestContext := c_ctx.GetRequestContext(ctx)
	if requestContext == nil {
		log.Println("Could not get request context")
		conn.Close()
		return
	}

	id := requestContext.GetSub()
	//uid := c_uid.DecodeFromBase58(id)

	client := &TicketClient{
		Conn:     conn,
		Send:     make(chan []byte, 256),
		TicketId: ticketID,
		UserID:   id, // Gán userID đã xác thực
	}

	h.Register <- client

	go h.handleTicketReads(client)
	go h.handleTicketWrites(client)
}

func (h *TicketHub) handleTicketReads(client *TicketClient) {
	defer func() {
		h.Unregister <- client
		client.Conn.Close()
	}()

	for {
		var data map[string]interface{}
		err := client.Conn.ReadJSON(&data)

		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket read error: %v", err)
			}
			break
		}

		// Sử dụng client.UserID (đã xác thực) thay vì lấy từ data
		msg, err := h.mapToTicketMessage(data, client.TicketId, client.UserID)

		if err != nil {
			log.Printf("Error mapping ticket message: %v", err)
			continue
		}

		msgBytes, _ := json.Marshal(msg)

		err = h.Producer.Publish("chat_messages", msgBytes)
		if err != nil {
			log.Printf("NSQ publish error: %v", err)
			h.Broadcast <- msgBytes
		}
	}
}

func (h *TicketHub) handleTicketWrites(client *TicketClient) {
	defer client.Conn.Close()

	for {
		select {
		case message, ok := <-client.Send:
			if !ok {
				// Channel đã đóng
				client.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := client.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Printf("WebSocket write error: %v", err)
				return
			}
		}
	}
}

func (h *TicketHub) mapToTicketMessage(data map[string]interface{}, ticketID string, userID string) (*entityTicketMessage.TicketMessage, error) {

	message := ""
	if msg, ok := data["message"].(string); ok {
		message = msg
	}

	return &entityTicketMessage.TicketMessage{
		FakeTicketID: ticketID,
		FakeSenderID: userID, // Sử dụng userID từ client (đã xác thực)
		Message:      message,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}, nil
}
