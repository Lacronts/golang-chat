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
	UserName  string `json:"userName"`
	Body      string `json:"body"`
	Time      string `json:"time"`
	TimeStamp int64  `json:"timestamp"`
	UserColor string `json:"userColor"`
}

//TIncomingMSG message for sending
type TIncomingMSG struct {
	From      string `json:"userName"`
	Body      string `json:"body"`
	UserColor string `json:"userColor"`
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

	r.HandleFunc("/ws/{id}", s.chatHandler)

	r.HandleFunc("/auth/{id}", s.checkUserName).Methods("GET")

	for {
		select {
		case user := <-s.addUser:
			s.users[user.id] = user
			log.Println("added user ", user.id)
			log.Println("now ", len(s.users), " users are connected to chat room")
		case user := <-s.remUser:
			delete(s.users, user.id)
			log.Println("now ", len(s.users), " users are connected to chat room")
		case msg := <-s.newMessage:
			s.sendAll(msg)
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

func (s *TServer) chatHandler(w http.ResponseWriter, req *http.Request) {
	req.Header.Set("Origin", "localhost:3000")
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

func (s *TServer) sendAll(msg *TIncomingMSG) {
	t := time.Now()
	outgoungMsg := TOutgoingMSG{
		UserName:  msg.From,
		Body:      msg.Body,
		Time:      t.Format("2 Jan 2006 15:04"),
		TimeStamp: t.UnixNano(),
		UserColor: msg.UserColor,
	}
	for _, user := range s.users {
		user.outgoingMessage <- &outgoungMsg
	}
}

//ReadIncomingMessage - read new message
func (s *TServer) ReadIncomingMessage(msg *TIncomingMSG) {
	log.Println("incoming message: ", msg)
	s.newMessage <- msg
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
