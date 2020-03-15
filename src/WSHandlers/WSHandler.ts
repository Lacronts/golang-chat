import { Dispatch } from 'redux';
import { ChatActionTypes } from 'Redux/Actions/ChatActionTypes';
import { ConnectionActionTypes } from 'Redux/Actions/ConnectionActionTypes';
import { IAppState, INewUserResponse, IAllUsersResponse, IIncomingMessages, IUser } from 'Models';
import { EReceivedDataKey } from 'Enums';
import { API_ADDRESS_WS } from 'Redux/Services/consts';
import { concatMessages } from 'WSHandlers/Utils';

class WSHandler {
  conn: WebSocket;

  private static instance: WSHandler;

  private constructor(private dispatch: Dispatch) {}

  public static getInstance(dispatch: Dispatch): WSHandler {
    if (!WSHandler.instance) {
      WSHandler.instance = new WSHandler(dispatch);
    }

    return WSHandler.instance;
  }

  private startListening = () => {
    console.info('...start listening');
    this.conn.addEventListener('close', this.onClose);
    this.conn.addEventListener('error', this.onError);
    this.conn.addEventListener('message', this.onReceiveData);
  };

  private stopListening = () => {
    console.info('...stop listening');
    this.conn.removeEventListener('close', this.onClose);
    this.conn.removeEventListener('error', this.onError);
    this.conn.removeEventListener('message', this.onReceiveData);
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

  private onReceiveData = (ev: MessageEvent) => {
    this.dispatch<any>((_, getState: () => IAppState) => {
      const { activeUsers, userName, targetUser } = getState().chat;
      const JSONData = JSON.parse(ev.data);
      Object.keys(JSONData).forEach(key => {
        switch (key) {
          case EReceivedDataKey.ALL_USERS_NOTIF: {
            const data = JSONData as IAllUsersResponse;
            if (data.users) {
              const newActiveUsers: IUser[] = data.users.map(el => ({ name: el.userName, color: el.color, isGroup: false, messages: [] }));
              this.dispatch({ type: ChatActionTypes.UPDATE_ACTIVE_USERS, payload: [...activeUsers, ...newActiveUsers] });
            }
            break;
          }
          case EReceivedDataKey.MESSAGE: {
            const newMessage = JSONData[EReceivedDataKey.MESSAGE] as IIncomingMessages;
            if (newMessage.groupName) {
              const newUsers = concatMessages(activeUsers, newMessage.groupName, newMessage, targetUser === newMessage.groupName);
              this.dispatch({ type: ChatActionTypes.UPDATE_ACTIVE_USERS, payload: newUsers });
            } else if (userName === newMessage.from) {
              const newUsers = concatMessages(activeUsers, targetUser, newMessage, true);
              this.dispatch({ type: ChatActionTypes.UPDATE_ACTIVE_USERS, payload: newUsers });
            } else {
              const newUsers = concatMessages(activeUsers, newMessage.from, newMessage, targetUser === newMessage.from);
              this.dispatch({ type: ChatActionTypes.UPDATE_ACTIVE_USERS, payload: newUsers });
            }
            break;
          }
          case EReceivedDataKey.NEW_USER_NOTIF: {
            const data = JSONData as INewUserResponse;
            const newUser: IUser = {
              name: data.newUser.userName,
              color: data.newUser.color,
              messages: [],
              isGroup: false,
            };
            const newActiveUsers = [...activeUsers, newUser];
            this.dispatch({ type: ChatActionTypes.UPDATE_ACTIVE_USERS, payload: newActiveUsers });
            break;
          }
          case EReceivedDataKey.REMOVE_USER_NOTIF: {
            const name = JSONData[EReceivedDataKey.REMOVE_USER_NOTIF] as string;
            const newActiveUsers = activeUsers.filter(user => user.name !== name);
            if (targetUser === name) {
              this.dispatch({ type: ChatActionTypes.SELECT_TARGET_USER, payload: { targetUser: null, activeUsers: newActiveUsers } });
            } else {
              this.dispatch({ type: ChatActionTypes.UPDATE_ACTIVE_USERS, payload: newActiveUsers });
            }
          }
        }
      });
    });
  };

  public init = (name: string): Promise<WebSocket | ErrorEvent> => {
    return new Promise((resolve, reject) => {
      this.conn = new WebSocket(`${API_ADDRESS_WS}/in-room/${name}`);
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
    const blob = new Blob([message], { type: 'application/json' });
    this.conn?.send(blob);
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

export { WSHandler };
