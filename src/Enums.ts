export enum EConnStatus {
  CLOSED = 'CLOSED',
  OPENED = 'OPENED',
}

export enum EReceivedDataKey {
  MESSAGE = 'msgData',
  NEW_USER_NOTIF = 'newUser',
  REMOVE_USER_NOTIF = 'remUser',
  ALL_USERS_NOTIF = 'users',
}

export enum ETarget {
  BROADCAST = 'General Chat',
}
