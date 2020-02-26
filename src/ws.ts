import { Dispatch } from 'redux';
import { ChatActionTypes } from 'Redux/Actions/ChatActionTypes';
import { ConnectionActionTypes } from 'Redux/Actions/ConnectionActionTypes';
import { IAppState } from 'Models';

class WebSocketHandler {
  conn: WebSocket;

  private static instance: WebSocketHandler;

  private constructor(private dispatch: Dispatch) {}

  private startListening = () => {
    console.log('...start listening');
    this.conn.addEventListener('close', this.onClose);
    this.conn.addEventListener('error', this.onError);
    this.conn.addEventListener('message', this.onMessage);
  };

  private stopListening = () => {
    console.log('...stop listening');
    this.conn.removeEventListener('close', this.onClose);
    this.conn.removeEventListener('error', this.onError);
    this.conn.removeEventListener('message', this.onMessage);
  };

  private onClose = () => {
    if (this.conn.readyState === this.conn.CLOSED) {
      this.stopListening();
      this.dispatch({ type: ConnectionActionTypes.CLOSE_CONNECTION });
      console.info('connection closed');
    }
  };

  private onError = (ev: Event) => {
    this.stopListening();
    console.error('An error occured', ev);
  };

  private onMessage = (ev: MessageEvent) => {
    this.dispatch<any>((_, getState: () => IAppState) => {
      const { messages } = getState().chat;
      const newMessages = messages.concat(JSON.parse(ev.data));
      this.dispatch({ type: ChatActionTypes.RECEIVE_MESSAGE, payload: newMessages });
    });
  };

  public static getInstance(dispatch: Dispatch): WebSocketHandler {
    if (!WebSocketHandler.instance) {
      WebSocketHandler.instance = new WebSocketHandler(dispatch);
    }

    return WebSocketHandler.instance;
  }

  public init = (name: string): Promise<WebSocket | ErrorEvent> => {
    return new Promise((resolve, reject) => {
      this.conn = new WebSocket(`ws://localhost:8080/ws/${name}`);
      this.conn.onopen = () => {
        console.info('connection established');
        this.startListening();
        this.dispatch({ type: ConnectionActionTypes.OPEN_CONNECTION });
        resolve(this.conn);
      };
      this.conn.onerror = err => {
        console.error('An error occured', err);
        reject(err);
      };
    });
  };

  public postMessage = (message: string) => {
    this.conn?.send(message);
  };

  public closeConnection = () => {
    this.conn?.close();
  };

  public isClosed = () => {
    if (this.conn) {
      return this.conn.CLOSED === this.conn.readyState;
    }
    return true;
  };
}

export { WebSocketHandler };
