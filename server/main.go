package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"server/chat"

	"github.com/gorilla/mux"
)

var serverHostName string

func init() {
	herokuConfigPort := os.Getenv("PORT")
	if herokuConfigPort == "" {
		serverHostName = fmt.Sprintf("%s:%s", "192.168.0.102", "8080")
	} else {
		serverHostName = fmt.Sprintf(":%s", herokuConfigPort)
	}
	log.Println("The serverHost url", serverHostName)

}

func main() {
	server := chat.NewServer()
	router := mux.NewRouter()
	go server.Listen(router)

	err := http.ListenAndServe(serverHostName, router)
	if err != nil {
		log.Fatal("ListenAndServe Err: ", err)
	}
}
