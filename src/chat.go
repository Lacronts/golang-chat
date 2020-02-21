package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

const (
	addr   = "127.0.0.1:8080"
	origin = "localhost:3000"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

//TUser - our user struct
type TUser struct {
	id              string
	conn            *websocket.Conn
	s               *TServer
	outgoingMessage chan *TOutgoingMSG
	doneCh          chan bool
}

// TServer - Type for our server.
type TServer struct {
	users      map[string]*TUser
	addUser    chan *TUser
	remUser    chan *TUser
	newMessage chan string
}

//TOutgoingMSG message for sending
type TOutgoingMSG struct {
	UserName  string `json:"userName"`
	Body      string `json:"body"`
	Timestamp string `json:"timestamp"`
}

func main() {
	server := newServer()
	router := mux.NewRouter()

	go server.Listen(router)

	err := http.ListenAndServe(addr, router)
	if err != nil {
		log.Fatal("ListenAndServe Err: ", err)
	}
}

func newServer() *TServer {
	users := make(map[string]*TUser)
	addUser := make(chan *TUser)
	removeUser := make(chan *TUser)
	newMessage := make(chan string)

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

//AddNewUser - adding new user on our server
func (s *TServer) AddNewUser(u *TUser) {
	log.Println("Adding user ", u.id)
	s.addUser <- u
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

func (s *TServer) sendAll(msg string) {
	t := time.Now().Format("2 Jan 2006 15:04")
	outgoungMsg := TOutgoingMSG{
		UserName:  "",
		Body:      msg,
		Timestamp: t,
	}
	for _, user := range s.users {
		outgoungMsg.UserName = user.id
		user.outgoingMessage <- &outgoungMsg
	}
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

//ReadIncomingMessage - read new message
func (s *TServer) ReadIncomingMessage(msg string) {
	log.Println("incoming message: ", msg)
	s.newMessage <- msg
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

func checkOrigin(req *http.Request) bool {
	reqOrigin := req.Header.Get("Origin")
	if reqOrigin == origin {
		return true
	}
	return false
}
