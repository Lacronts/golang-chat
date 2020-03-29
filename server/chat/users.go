package chat

import (
	"log"

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
	id              string
	conn            *websocket.Conn
	s               *Server
	outgoingMessage chan *ResponseMsg
	data            chan *ClientMSG
	newUserCh       chan *Notification
	remUserCh       chan *string
	allUsersCh      chan *[]Notification
	color           string
	doneCh          chan bool
}

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
	for {
		select {
		case msg := <-u.outgoingMessage:
			//log.Println("outgoing Message", msg)
			u.conn.WriteJSON(&msg)
		case data := <-u.data:
			u.conn.WriteJSON(&data)
		case newUser := <-u.newUserCh:
			newUserResp := NewUserResp{
				NewUser: newUser,
			}
			u.conn.WriteJSON(&newUserResp)
		case removedUser := <-u.remUserCh:
			remUserResp := RemUserResp{
				RemUser: removedUser,
			}
			u.conn.WriteJSON(&remUserResp)
		case allUsers := <-u.allUsersCh:
			allUsersResp := &AllUsersResp{
				Users: allUsers,
			}
			u.conn.WriteJSON(&allUsersResp)
		case <-u.doneCh:
			u.s.removeUser(u)
			u.doneCh <- true
			return
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

	outgoingMessage := make(chan *ResponseMsg)
	data := make(chan *ClientMSG)
	color := GetRandomColorInRgb()
	doneCh := make(chan bool)
	newUserCh := make(chan *Notification)
	remUserCh := make(chan *string)
	allUsersCh := make(chan *[]Notification)
	log.Printf("user %s created", userID)

	return &User{
		userID, conn, s, outgoingMessage, data, newUserCh, remUserCh, allUsersCh, color, doneCh,
	}
}

func (s *Server) removeUser(user *User) {
	log.Println("removing user ", user.id)
	s.remUser <- user
}
