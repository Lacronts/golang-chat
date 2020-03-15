import React from 'react';
import { ETarget } from 'Enums';
import { IUser } from 'Models';
import { countUnreadMessages } from 'Utils';
import { useStyles } from './styles';

interface IProps {
  data: IUser;
  selectedUser: string;
  onSelect: (userID: string) => void;
}

const User: React.SFC<IProps> = ({ data, onSelect, selectedUser }: IProps) => {
  const isActive = data.name === selectedUser;
  const isBroadcast = data.name === ETarget.BROADCAST;
  const classes = useStyles({ isActive, color: data.color });
  const unreadMessages = countUnreadMessages(data.messages);

  const handleSelectUser = () => {
    onSelect(data.name);
  };

  return (
    <div className={classes.user} onClick={handleSelectUser}>
      {isBroadcast ? 'General chat' : data.name}
      {unreadMessages && <div className={classes.unreadMessages}>{unreadMessages}</div>}
    </div>
  );
};

export { User };
