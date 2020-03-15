package chat

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

const (
	origin = "localhost:3000"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// Server - structure of our server.
type Server struct {
	users      map[string]*User
	addUser    chan *User
	remUser    chan *User
	newMessage chan *IncomingMSG
}

// ResponseName - user validation structure.
type ResponseName struct {
	UserName string `json:"userName"`
}

//NewServer - creating new webSocket server.
func NewServer() *Server {
	users := make(map[string]*User)
	addUser := make(chan *User)
	removeUser := make(chan *User)
	newMessage := make(chan *IncomingMSG)

	return &Server{
		users,
		addUser,
		removeUser,
		newMessage,
	}
}

//Listen - New Request Listener.
func (s *Server) Listen(r *mux.Router) {
	fmt.Println("server listening...")

	r.HandleFunc("/in-room/{id}", s.roomHandler).Methods("GET")

	r.HandleFunc("/auth/{id}", s.checkUserName).Methods("GET")

	for {
		select {
		case user := <-s.addUser:
			s.notifyExistingUsersOfNew(user)
			s.users[user.id] = user
			s.notifyNewUserAboutExisting(user)
			log.Println("now ", len(s.users), " users are connected to chat room")
		case user := <-s.remUser:
			delete(s.users, user.id)
			s.notifyAboutUserDeletion(user)
			log.Println("now ", len(s.users), " users are connected to chat room")
		case msg := <-s.newMessage:
			s.send(msg)
		}
	}
}

func (s *Server) checkUserName(w http.ResponseWriter, res *http.Request) {
	enableCors(&w)
	w.Header().Set("Content-Type", "application/json")
	userID := mux.Vars(res)["id"]

	if _, exist := s.users[userID]; exist {
		http.Error(w, "User with the same name already exist", http.StatusBadRequest)
		return
	}
	response := ResponseName{
		UserName: userID,
	}
	json.NewEncoder(w).Encode(response)
}

func (s *Server) roomHandler(w http.ResponseWriter, req *http.Request) {
	upgrader.CheckOrigin = checkOrigin

	userID := mux.Vars(req)["id"]

	if _, exist := s.users[userID]; exist {
		http.Error(w, "user with the same ID already exist", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, req, nil)
	if err != nil {
		log.Fatal("Cannot create connection: ", err)
	}

	newUser := CreateUser(userID, conn, s)
	s.AddNewUser(newUser)

	newUser.Listen()
	fmt.Println("connection created")
}

func (s *Server) send(msg *IncomingMSG) {
	outgoingMessage := createOutgoingMessage(msg)
	if len(msg.GroupName) > 0 {
		for _, user := range s.users {
			user.outgoingMessage <- outgoingMessage
		}
		return
	}
	if target, ok := s.users[msg.Target]; ok {
		target.outgoingMessage <- outgoingMessage
	}
	if user, ok := s.users[msg.Author]; ok {
		user.outgoingMessage <- outgoingMessage
	}
}

//ReadIncomingMessage - read new message.
func (s *Server) ReadIncomingMessage(msg *IncomingMSG) {
	log.Println("incoming message: ", msg)
	s.newMessage <- msg
}

func (s *Server) notifyExistingUsersOfNew(newUser *User) {
	log.Println("start notify existing users about new user")
	resp := Notification{
		UserID: newUser.id,
		Color:  newUser.color,
	}

	for _, user := range s.users {
		user.newUserCh <- &resp
	}
}

func (s *Server) notifyNewUserAboutExisting(newUser *User) {
	log.Println("start notify new users about existing")
	resp := []Notification(nil)

	for _, user := range s.users {
		if user.id != newUser.id {
			resp = append(resp, Notification{
				UserID: user.id,
				Color:  user.color,
			})
		}
	}

	newUser.allUsersCh <- &resp
}

func (s *Server) notifyAboutUserDeletion(remUser *User) {
	log.Println("start notifying about removing user")
	for _, user := range s.users {
		user.remUserCh <- &remUser.id
	}
}

func createOutgoingMessage(msg *IncomingMSG) *ResponseMsg {
	t := time.Now()
	outgoingMsg := OutgoingMSG{
		Author:    msg.Author,
		Message:   msg.Message,
		Time:      t.Format("2 Jan 2006 15:04"),
		TimeStamp: t.UnixNano(),
		UserColor: msg.UserColor,
		GroupName: msg.GroupName,
		IsUnread:  true,
	}
	return &ResponseMsg{
		MsgData: &outgoingMsg,
	}
}

// fake check origin.
func checkOrigin(req *http.Request) bool {
	return true
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}
