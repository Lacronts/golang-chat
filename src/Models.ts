import { AxiosError } from 'axios';
import { EConnStatus, EReceivedDataKey } from 'Enums';

export interface IIncomingMessages {
  from: string;
  message: string;
  timestamp: string;
  time: string;
  userColor: string;
  groupName: string;
  isUnread: boolean;
}

export interface IUser {
  name: string;
  color: string;
  messages: IIncomingMessages[];
  isGroup: boolean;
}

export interface INewUser {
  userName: string;
  color: string;
}

export interface INewUserResponse {
  newUser: INewUser;
}

export interface IAllUsersResponse {
  users: INewUser[];
}

export interface INewMessageResponse {
  msgData: IIncomingMessages;
}

export interface IChatState {
  userName: string;
  targetUser: string;
  signInErrors: AxiosError;
  activeUsers: IUser[];
  isOpenMenu: boolean;
  caller: string;
  callInProgress: boolean;
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

export interface IIncomingData {
  target: string;
  data: any;
  type: EReceivedDataKey;
  author: string;
}
