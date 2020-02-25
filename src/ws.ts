class WebSocketHandler {
  conn: WebSocket;
  currentUserID: string;

  init = (name: string) => {
    this.conn = new WebSocket(`ws://localhost:8080/ws/${name}`);
    this.conn.onopen = () => {
      this.currentUserID = name;
      console.info('connection established');
    };
    return this.conn;
  };

  postMessage = (message: string) => {
    this.conn?.send(message);
  };

  getUserID = () => this.currentUserID;

  isClosed = () => {
    if (this.conn) {
      return this.conn.readyState === this.conn.CLOSED;
    }
    return true;
  };

  isReady = () => {
    if (this.conn) {
      return this.conn.readyState === this.conn.OPEN;
    }
    return false;
  };

  closeConnection = () => {
    this.conn?.close();
  };
}

let webSocketCache: WebSocketHandler = null;

export const getWebSocketHandler = () => webSocketCache || (webSocketCache = new WebSocketHandler());
