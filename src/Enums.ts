export enum EConnStatus {
  CLOSED = 'CLOSED',
  OPENED = 'OPENED',
}

export enum EReceivedDataKey {
  ANSWER = 'answer',
  CANDIDATE = 'candidate',
  OFFER = 'offer',
  CANCEL_CALL = 'cancelCall',
  MESSAGE = 'message',
  MESSAGE_DATA = 'msgData',
  NEW_USER_NOTIF = 'newUser',
  REMOVE_USER_NOTIF = 'remUser',
  ALL_USERS_NOTIF = 'users',
}

export enum ETarget {
  BROADCAST = 'General Chat',
}

export enum EReasonDropCall {
  TIMEOUT,
  CANCEL,
}
