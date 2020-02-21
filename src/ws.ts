class WebSocketHandler {
  conn: WebSocket;

  init = (name: string) => {
    this.conn = new WebSocket(`ws://127.0.0.1:8080/ws/${name}`);
    this.conn.onopen = () => console.info('Соединение установлено');
    return this.conn;
  };

  postMessage = (message: string) => {
    this.conn?.send(message);
  };

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
