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

//ResponseMsg - new message with a key, for correct processing on the client.
type ResponseMsg struct {
	MsgData *OutgoingMSG `json:"msgData"`
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
	Target  string `json:"target"`
	Message string `json:"message"`
	IsGroup bool   `json:"isGroup"`
}