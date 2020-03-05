import { createBrowserHistory } from 'history';
import { IUser } from 'Models';

export const history = createBrowserHistory();

export const sortUsersByMessageDate = (activeUSers: IUser[]): IUser[] => {
  const res = activeUSers.sort(
    (a, b) =>
      Math.max(...b.messages.map(message => +message.timestamp || 0)) - Math.max(...a.messages.map(message => +message.timestamp || 0)),
  );

  return res;
};
