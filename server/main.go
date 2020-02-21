package main

import (
	"log"
	"net/http"
	"server/chat"

	"github.com/gorilla/mux"
)

const (
	addr = "127.0.0.1:8080"
)

func main() {
	server := chat.NewServer()
	router := mux.NewRouter()

	go server.Listen(router)

	err := http.ListenAndServe(addr, router)
	if err != nil {
		log.Fatal("ListenAndServe Err: ", err)
	}
}
