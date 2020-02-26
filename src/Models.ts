import { AxiosError } from 'axios';
import { EConnStatus } from 'Enums';

export interface IIncomingMessages {
  userName: string;
  body: string;
  timestamp: string;
  time: string;
  userColor: string;
}

export interface IChatState {
  userName: string;
  signInErrors: AxiosError;
  messages: IIncomingMessages[];
}

export interface IConnectionState {
  status: EConnStatus;
}

export interface IReduxAction<T> {
  type: string;
  payload: T;
}

export interface IAppState {
  chat: IChatState;
  connection: IConnectionState;
}
