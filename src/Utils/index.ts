import { createBrowserHistory } from 'history';
import { IUser, IIncomingMessages } from 'Models';

export const history = createBrowserHistory();

export const sortUsersByMessageDate = (activeUSers: IUser[]): IUser[] => {
  const res = activeUSers.sort(
    (a, b) =>
      Math.max(...b.messages.map(message => +message.timestamp || 0)) - Math.max(...a.messages.map(message => +message.timestamp || 0)),
  );

  return res;
};

export const countUnreadMessages = (messages: IIncomingMessages[]) => {
  const count = messages.reduce((count, msg) => (msg.isUnread ? ++count : count), 0);
  return count > 0 ? (count > 99 ? '99+' : count) : null;
};

export const getUnreadMessages = (users: IUser[]) => {
  return users.reduce((count, user) => {
    let unreadMessages = count;
    user.messages.forEach(message => (message.isUnread ? unreadMessages++ : null));
    return unreadMessages;
  }, 0);
};

export const toggleScrollBar = (flag: boolean) => {
  const scrollBars = document.getElementsByClassName('simplebar-track simplebar-vertical');
  for (let i = 0; i < scrollBars.length; i++) {
    const scrollBar = scrollBars[i] as HTMLElement;
    flag ? (scrollBar.style.opacity = '1') : (scrollBar.style.opacity = '0');
  }
};
