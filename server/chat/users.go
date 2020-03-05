package chat

import (
	"log"

	"github.com/gorilla/websocket"
)

//TUserNotify - new users for room
type TUserNotify struct {
	UserID string `json:"userName"`
	Color  string `json:"color"`
}

//TNewUserResp Notification channel abount new users.
type TNewUserResp struct {
	NewUser *TUserNotify `json:"newUser"`
}

//TRemUserResp Notification about removed user.
type TRemUserResp struct {
	RemUser *string `json:"remUser"`
}

//TAllUsersResp - Response struc for first user login.
type TAllUsersResp struct {
	Users *[]TUserNotify `json:"users"`
}

//TUser - our user struct
type TUser struct {
	id              string
	conn            *websocket.Conn
	s               *TServer
	outgoingMessage chan *TResponseMessage
	newUserCh       chan *TUserNotify
	remUserCh       chan *string
	allUsersCh      chan *[]TUserNotify
	color           string
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
		case newUser := <-u.newUserCh:
			newUserResp := TNewUserResp{
				NewUser: newUser,
			}
			u.conn.WriteJSON(&newUserResp)
		case removedUser := <-u.remUserCh:
			remUserResp := TRemUserResp{
				RemUser: removedUser,
			}
			u.conn.WriteJSON(&remUserResp)
		case allUsers := <-u.allUsersCh:
			allUsersResp := &TAllUsersResp{
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

//ListenRead - listener for reading messages
func (u *TUser) ListenRead() {
	for {
		select {
		case <-u.doneCh:
			u.s.removeUser(u)
			u.doneCh <- true
			return
		default:
			msg := TClientMSG{}
			err := u.conn.ReadJSON(&msg)
			if err != nil {
				u.doneCh <- true
				log.Println("Error while reading message", err)
			} else {
				log.Println(msg)
				if msg.IsGroup {
					message := &TIncomingMSG{
						From:      u.id,
						Message:   msg.Message,
						UserColor: u.color,
						GroupName: msg.Target,
					}
					u.s.ReadIncomingMessage(message)
				} else {
					message := &TIncomingMSG{
						From:      u.id,
						Target:    msg.Target,
						Message:   msg.Message,
						UserColor: u.color,
					}
					u.s.ReadIncomingMessage(message)
				}
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

	outgoingMessage := make(chan *TResponseMessage)
	color := GetRandomColorInRgb()
	doneCh := make(chan bool)
	newUserCh := make(chan *TUserNotify)
	remUserCh := make(chan *string)
	allUsersCh := make(chan *[]TUserNotify)
	log.Printf("user %s created", userID)

	return &TUser{
		userID, conn, s, outgoingMessage, newUserCh, remUserCh, allUsersCh, color, doneCh,
	}
}

func (s *TServer) removeUser(user *TUser) {
	log.Println("removing user ", user.id)
	s.remUser <- user
}
