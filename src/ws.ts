class WebSocketClass {
  conn: WebSocket;
  constructor() {
    this.conn = new WebSocket('ws://127.0.0.1:8080/chat');
    this.conn.onopen = () => {
      console.info('соединение установлено');
    };
    this.conn.onerror = function(this, ev: Event) {
      console.info('не удалось установить соединение: ', ev);
    };
  }
}

let webSocketCache: WebSocketClass = null;

export const getWebSocketHandler = () =>
  webSocketCache || (webSocketCache = new WebSocketClass());
