package chat

import (
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
}

//TIncomingMSG message for sending
type TIncomingMSG struct {
	From string `json:"userName"`
	Body string `json:"body"`
}

// TServer - Type for our server.
type TServer struct {
	users      map[string]*TUser
	addUser    chan *TUser
	remUser    chan *TUser
	newMessage chan *TIncomingMSG
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

	r.HandleFunc("/ws/{id}", func(w http.ResponseWriter, r *http.Request) {
		s.chatHandler(w, r)
	})

	for {
		select {
		case user := <-s.addUser:
			log.Println("added user ", user.id)
			s.users[user.id] = user
			log.Println("now ", len(s.users), " users are connected to chat room")
		case user := <-s.remUser:
			delete(s.users, user.id)
			log.Println("now ", len(s.users), " users are connected to chat room")
		case msg := <-s.newMessage:
			s.sendAll(msg)
		}

	}
}

func (s *TServer) chatHandler(w http.ResponseWriter, req *http.Request) {
	req.Header.Set("Origin", "localhost:3000")
	upgrader.CheckOrigin = checkOrigin
	conn, err := upgrader.Upgrade(w, req, nil)

	userID := mux.Vars(req)["id"]

	newUser := CreateUser(userID, conn, s)

	s.AddNewUser(newUser)

	if err != nil {
		log.Fatal("Cannot create connection: ", err)
	}
	fmt.Println("connection created")

	newUser.Listen()
}

func (s *TServer) sendAll(msg *TIncomingMSG) {
	t := time.Now()
	outgoungMsg := TOutgoingMSG{
		UserName:  msg.From,
		Body:      msg.Body,
		Time:      t.Format("2 Jan 2006 15:04"),
		TimeStamp: t.UnixNano(),
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
