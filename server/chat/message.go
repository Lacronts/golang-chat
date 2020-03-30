package chat

//OutgoingMSG - message to be sent to the client
type OutgoingMSG struct {
	Author    string `json:"from"`
	Message   string `json:"message"`
	Time      string `json:"time"`
	TimeStamp int64  `json:"timestamp"`
	UserColor string `json:"userColor"`
	GroupName string `json:"groupName"`
	IsUnread  bool   `json:"isUnread"`
}

//IncomingMSG - incoming message.
type IncomingMSG struct {
	Author    string
	Target    string
	Message   string
	UserColor string
	GroupName string
}

//ClientMSG - structure received from the client.
type ClientMSG struct {
	Target  string      `json:"target"`
	Data    interface{} `json:"data"`
	IsGroup bool        `json:"isGroup"`
	Type    string      `json:"type"`
	Author  string      `json:"author"`
}
