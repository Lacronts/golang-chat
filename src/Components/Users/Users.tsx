import React from 'react';
import { User } from 'Components/User/User';
import { IUser } from 'Models';
import { ChatActions } from 'Redux/Actions/ChatActions';
import { sortUsersByMessageDate } from 'Utils';
import { useStyles } from './styles';

interface IProps {
  activeUsers: IUser[];
  targetUser: string;
  isOpenMenu: boolean;
  chatActions: ChatActions;
}

const Users: React.SFC<IProps> = ({ activeUsers, targetUser, chatActions, isOpenMenu }: IProps) => {
  const classes = useStyles({ isOpen: isOpenMenu });
  const users = sortUsersByMessageDate(activeUsers);

  const selectUser = (targetUser: string) => chatActions.selectTargetUser(targetUser);

  const handleCloseUserMenu = () => chatActions.closeMenu();

  return (
    <>
      <div className={classes.wrapper}>
        <div className={classes.header}>Chat Room</div>
        <div>
          {users.map(user => (
            <User data={user} key={user.name} onSelect={selectUser} selectedUser={targetUser} />
          ))}
        </div>
      </div>
      {isOpenMenu && <div className={classes.backdrop} onClick={handleCloseUserMenu} />}
    </>
  );
};

export { Users };
