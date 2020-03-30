package chat

import (
	"log"
	"time"

	"github.com/gorilla/websocket"
)

//Notification - new users for room
type Notification struct {
	UserID string `json:"userName"`
	Color  string `json:"color"`
}

//NewUserResp Notification channel abount new users.
type NewUserResp struct {
	NewUser *Notification `json:"newUser"`
}

//RemUserResp Notification about removed user.
type RemUserResp struct {
	RemUser *string `json:"remUser"`
}

//AllUsersResp - Response struc for first user login.
type AllUsersResp struct {
	Users *[]Notification `json:"users"`
}

//User - our user struct
type User struct {
	id     string
	conn   *websocket.Conn
	s      *Server
	data   chan *ClientMSG
	color  string
	doneCh chan bool
}

const (
	// Time allowed to write a message to the peer.
	writeWait = 60 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 40 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

//AddNewUser - method for adding a new user.
func (s *Server) AddNewUser(u *User) {
	log.Println("Adding user ", u.id)
	s.addUser <- u
}

// Listen - listener for sent and received messages.
func (u *User) Listen() {
	go u.ListenWrite()
	u.ListenRead()
}

//ListenWrite - listener for send messages.
func (u *User) ListenWrite() {
	log.Println("...listening to write message")
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		u.conn.Close()
	}()
	for {
		select {
		case data := <-u.data:
			u.conn.WriteJSON(&data)
		case <-u.doneCh:
			u.s.removeUser(u)
			u.doneCh <- true
			return
		case <-ticker.C:
			if err := u.conn.WriteJSON(&ClientMSG{Target: u.id, Type: "ping"}); err != nil {
				log.Println("ticker ERR", err)
				u.doneCh <- true
			}
		}
	}
}

//ListenRead - listener for received messages.
func (u *User) ListenRead() {
	for {
		select {
		case <-u.doneCh:
			u.s.removeUser(u)
			u.doneCh <- true
			return
		default:
			msg := ClientMSG{}
			err := u.conn.ReadJSON(&msg)
			if err != nil {
				u.doneCh <- true
				log.Println("Error while reading message", err)
			} else {
				msg.Author = u.id
				u.s.ReadIncomingData(&msg)
			}
		}
	}
}

// CreateUser - method for adding a new user to the server.
func CreateUser(userID string, conn *websocket.Conn, s *Server) *User {
	if conn == nil {
		log.Fatal("connection cannot be nil")
	}
	if s == nil {
		log.Fatal("server cannot be nil")
	}

	data := make(chan *ClientMSG)
	color := GetRandomColorInRgb()
	doneCh := make(chan bool)
	log.Printf("user %s created", userID)

	return &User{
		userID, conn, s, data, color, doneCh,
	}
}

func (s *Server) removeUser(user *User) {
	log.Println("removing user ", user.id)
	s.remUser <- user
}
