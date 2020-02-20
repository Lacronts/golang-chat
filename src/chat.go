package main

import (
	"fmt"
	"log"
	"net/http"

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

type user struct {
	id       string
	conn     *websocket.Conn
	userChan chan string
}

// TServer - Type for our server
type TServer struct {
	users      map[string]*user
	addUser    chan *user
	removeUser chan *user
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
	users := make(map[string]*user)
	addUser := make(chan *user)
	removeUser := make(chan *user)

	return &TServer{
		users,
		addUser,
		removeUser,
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
		}
	}
}

//AddNewUser - adding new user on our server
func (s *TServer) AddNewUser(u *user) {
	log.Println("Adding user ", u.id)
	s.addUser <- u
}

func (s *TServer) chatHandler(w http.ResponseWriter, req *http.Request) {
	req.Header.Set("Origin", "localhost:3000")
	upgrader.CheckOrigin = checkOrigin
	conn, err := upgrader.Upgrade(w, req, nil)

	userID := mux.Vars(req)["id"]
	fmt.Println(userID)

	firstUser := user{
		id:       userID,
		conn:     conn,
		userChan: make(chan string),
	}

	s.AddNewUser(&firstUser)

	if err != nil {
		log.Fatal("Cannot create connection: ", err)
	}
	fmt.Println("connection created")

	defer conn.Close()
	communicate(conn)
}

func checkOrigin(req *http.Request) bool {
	reqOrigin := req.Header.Get("Origin")
	if reqOrigin == origin {
		return true
	}
	return false
}

func communicate(conn *websocket.Conn) {
	for {
		message, p, err := conn.ReadMessage()
		if err != nil {
			log.Fatal("ReadMessage Err: ", err)
		}

		fmt.Println("message", message)
		fmt.Println("bytes", string(p))

		response := "Я получил твое сообщение" + string(p)

		err = conn.WriteMessage(message, []byte(response))
		if err != nil {
			log.Fatal("WriteMessage", err)
		}
	}
}
