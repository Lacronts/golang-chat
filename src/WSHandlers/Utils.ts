import { IUser, IIncomingMessages } from 'Models';

export function concatMessages(users: IUser[], searchParam: string, newMessage: IIncomingMessages, isRead: boolean = false): IUser[] {
  return users.map(user => {
    if (user.name === searchParam) {
      return {
        ...user,
        messages: [...user.messages, { ...newMessage, isUnread: !isRead }],
      };
    }
    return user;
  });
}
