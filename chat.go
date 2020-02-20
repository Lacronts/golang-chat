package main

import (
	"fmt"
	"log"
	"net/http"

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
	id   int
	conn *websocket.Conn
}

// TServer - Type for our server
type TServer struct {
	users map[int]*user
}

//Server out server
var Server TServer

func main() {
	http.HandleFunc("/chat", func(w http.ResponseWriter, r *http.Request) {
		handler(w, r)
	})

	err := http.ListenAndServe(addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe Err: ", err)
	}
}

func handler(w http.ResponseWriter, req *http.Request) {
	req.Header.Set("Origin", "localhost:3000")
	upgrader.CheckOrigin = checkOrigin
	conn := Server.createConnection(w, req)
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

func (s TServer) createConnection(w http.ResponseWriter, req *http.Request) *websocket.Conn {
	conn, err := upgrader.Upgrade(w, req, nil)

	if err != nil {
		log.Fatal("Cannot create connection: ", err)
	}
	fmt.Println("connection created")
	return conn
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
