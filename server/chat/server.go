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

//TOutgoingMSG message for sending
type TOutgoingMSG struct {
	From      string `json:"from"`
	Message   string `json:"message"`
	Time      string `json:"time"`
	TimeStamp int64  `json:"timestamp"`
	UserColor string `json:"userColor"`
	GroupName string `json:"groupName"`
}

//TResponseMessage message for response to client.
type TResponseMessage struct {
	MsgData TOutgoingMSG `json:"msgData"`
}

//TIncomingMSG message for sending
type TIncomingMSG struct {
	From      string
	Target    string
	Message   string
	UserColor string
	GroupName string
}

//TClientMSG message for sending
type TClientMSG struct {
	Target  string `json:"target"`
	Message string `json:"message"`
	IsGroup bool   `json:"isGroup"`
}

// TServer - Type for our server.
type TServer struct {
	users      map[string]*TUser
	addUser    chan *TUser
	remUser    chan *TUser
	newMessage chan *TIncomingMSG
}

// TResponseName - Type for checkUserName response.
type TResponseName struct {
	UserName string `json:"userName"`
}

//NewServer - creating new webSocket server.
func NewServer() *TServer {
	users := make(map[string]*TUser)
	addUser := make(chan *TUser)
	removeUser := make(chan *TUser)
	newMessage := make(chan *TIncomingMSG)

	return &TServer{
		users,
		addUser,
		removeUser,
		newMessage,
	}
}

//Listen Our server listener
func (s *TServer) Listen(r *mux.Router) {
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
			s.notifyAboutRemUser(user)
			log.Println("now ", len(s.users), " users are connected to chat room")
		case msg := <-s.newMessage:
			s.send(msg)
		}
	}
}

func (s *TServer) checkUserName(w http.ResponseWriter, res *http.Request) {
	enableCors(&w)
	w.Header().Set("Content-Type", "application/json")
	userID := mux.Vars(res)["id"]

	if _, exist := s.users[userID]; exist {
		http.Error(w, "User with the same name already exist", http.StatusBadRequest)
		return
	}
	response := TResponseName{
		UserName: userID,
	}
	json.NewEncoder(w).Encode(response)
}

func (s *TServer) roomHandler(w http.ResponseWriter, req *http.Request) {
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

func (s *TServer) send(msg *TIncomingMSG) {
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
	if user, ok := s.users[msg.From]; ok {
		user.outgoingMessage <- outgoingMessage
	}
}

//ReadIncomingMessage - read new message
func (s *TServer) ReadIncomingMessage(msg *TIncomingMSG) {
	log.Println("incoming message: ", msg)
	s.newMessage <- msg
}

func (s *TServer) notifyExistingUsersOfNew(newUser *TUser) {
	log.Println("start notify existing users about new user")
	resp := TUserNotify{
		UserID: newUser.id,
		Color:  newUser.color,
	}

	for _, user := range s.users {
		user.newUserCh <- &resp
	}
}

func (s *TServer) notifyNewUserAboutExisting(newUser *TUser) {
	log.Println("start notify new users about existing")
	resp := []TUserNotify(nil)

	for _, user := range s.users {
		if user.id != newUser.id {
			resp = append(resp, TUserNotify{
				UserID: user.id,
				Color:  user.color,
			})
		}
	}

	newUser.allUsersCh <- &resp
}

func (s *TServer) notifyAboutRemUser(remUser *TUser) {
	log.Println("start notifying about removing user")
	for _, user := range s.users {
		user.remUserCh <- &remUser.id
	}
}

func createOutgoingMessage(msg *TIncomingMSG) *TResponseMessage {
	t := time.Now()
	outgoingMsg := TOutgoingMSG{
		From:      msg.From,
		Message:   msg.Message,
		Time:      t.Format("2 Jan 2006 15:04"),
		TimeStamp: t.UnixNano(),
		UserColor: msg.UserColor,
		GroupName: msg.GroupName,
	}
	return &TResponseMessage{
		MsgData: outgoingMsg,
	}
}

func checkOrigin(req *http.Request) bool {
	return true
	// reqOrigin := req.Header.Get("Origin")
	// if reqOrigin == origin {
	// 	return true
	// }
	// return false
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}
