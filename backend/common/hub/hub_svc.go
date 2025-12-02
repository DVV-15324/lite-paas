package hub

import (
	"encoding/json"
	//"github.com/gorilla/mux"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type ServiceClient struct {
	Conn      *websocket.Conn
	Send      chan []byte
	ServiceId string
}

type BroadcastMessage struct {
	ServiceId string
	Data      []byte
}

type ServiceHub struct {
	Clients    map[string]map[*ServiceClient]bool
	Broadcast  chan BroadcastMessage
	Register   chan *ServiceClient
	Unregister chan *ServiceClient
}

func NewServiceHub() *ServiceHub {
	return &ServiceHub{
		Clients:    make(map[string]map[*ServiceClient]bool),
		Broadcast:  make(chan BroadcastMessage),
		Register:   make(chan *ServiceClient),
		Unregister: make(chan *ServiceClient),
	}
}

func (h *ServiceHub) Run() {
	log.Println("ServiceHub is running...")

	for {
		select {
		case client := <-h.Register:
			if _, exists := h.Clients[client.ServiceId]; !exists {
				h.Clients[client.ServiceId] = make(map[*ServiceClient]bool)
			}
			h.Clients[client.ServiceId][client] = true
			log.Printf("Client connected to service: %s. Total clients: %d",
				client.ServiceId, len(h.Clients[client.ServiceId]))

		case client := <-h.Unregister:
			if clients, exists := h.Clients[client.ServiceId]; exists {
				if _, exists := clients[client]; exists {
					delete(clients, client)
					close(client.Send)
					log.Printf("Client disconnected from service: %s. Total clients: %d",
						client.ServiceId, len(clients))

					if len(clients) == 0 {
						delete(h.Clients, client.ServiceId)
					}
				}
			}

		case broadcastMsg := <-h.Broadcast:
			h.broadcastToService(broadcastMsg.ServiceId, broadcastMsg.Data)
		}
	}
}

func (h *ServiceHub) broadcastToService(serviceId string, data []byte) {
	if clients, exists := h.Clients[serviceId]; exists {
		log.Printf("📤 Broadcasting to service: %s, clients: %d", serviceId, len(clients))

		for client := range clients {
			select {
			case client.Send <- data:
				// Gửi thành công
			default:
				log.Printf("Client channel full, closing connection")
				close(client.Send)
				delete(clients, client)
			}
		}
	} else {
		log.Printf("No clients found for service: %s", serviceId)
	}
}

// Hàm helper để gửi message dạng JSON an toàn
func (h *ServiceHub) SendJSONToService(serviceId string, data interface{}) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Printf("Error marshaling JSON: %v", err)
		return
	}

	h.Broadcast <- BroadcastMessage{
		ServiceId: serviceId,
		Data:      jsonData,
	}
}

func (h *ServiceHub) HandleServiceWS(w http.ResponseWriter, r *http.Request, serviceId string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Service WebSocket upgrade error:", err)
		return
	}

	client := &ServiceClient{
		Conn:      conn,
		Send:      make(chan []byte, 256),
		ServiceId: serviceId,
	}

	h.Register <- client

	go h.handleServiceReads(client)
	go h.handleServiceWrites(client)
}

func (h *ServiceHub) handleServiceReads(client *ServiceClient) {
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

		if msgType, ok := data["type"].(string); ok {
			switch msgType {
			case "ping":
				client.Conn.WriteJSON(map[string]interface{}{
					"type": "pong",
				})
			}
		}
	}
}

func (h *ServiceHub) handleServiceWrites(client *ServiceClient) {
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
