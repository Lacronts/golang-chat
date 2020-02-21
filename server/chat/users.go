package chat

import (
	"log"

	"github.com/gorilla/websocket"
)

//TUser - our user struct
type TUser struct {
	id              string
	conn            *websocket.Conn
	s               *TServer
	outgoingMessage chan *TOutgoingMSG
	doneCh          chan bool
}

//AddNewUser - adding new user on our server
func (s *TServer) AddNewUser(u *TUser) {
	log.Println("Adding user ", u.id)
	s.addUser <- u
}

// Listen - communicate
func (u *TUser) Listen() {
	go u.ListenWrite()
	u.ListenRead()
}

//ListenWrite - listener for wrinig messages
func (u *TUser) ListenWrite() {
	log.Println("...listening to write message")

	for {
		select {
		case msg := <-u.outgoingMessage:
			log.Println("outgoing Message", msg)
			u.conn.WriteJSON(&msg)
		case <-u.doneCh:
			u.s.removeUser(u)
			u.doneCh <- true
			return
		}
	}
}

//ListenRead - listener for reading messages
func (u *TUser) ListenRead() {
	for {
		select {
		case <-u.doneCh:
			u.s.removeUser(u)
			u.doneCh <- true
			return
		default:
			_, p, err := u.conn.ReadMessage()

			if err != nil {
				u.doneCh <- true
				log.Println("Error while reading JSON from WS", err)
			} else {
				u.s.ReadIncomingMessage(string(p))
			}
		}
	}
}

// CreateUser - creating new user
func CreateUser(userID string, conn *websocket.Conn, s *TServer) *TUser {
	if conn == nil {
		log.Fatal("connection cannot be nil")
	}
	if s == nil {
		log.Fatal("server cannot be nil")
	}

	outgoingMessage := make(chan *TOutgoingMSG)
	doneCh := make(chan bool)
	log.Printf("user %s created", userID)

	return &TUser{
		userID, conn, s, outgoingMessage, doneCh,
	}
}

func (s *TServer) removeUser(user *TUser) {
	log.Println("removing user ", user.id)
	s.remUser <- user
}
