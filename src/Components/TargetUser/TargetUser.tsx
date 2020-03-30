import React, { useState, useRef, useEffect } from 'react';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Call from '@material-ui/icons/Call';
import { useStyles } from './styles';
import { ChatActions } from 'Redux/Actions/ChatActions';
import { IUser } from 'Models';

interface IProps {
  chatActions: ChatActions;
  user: IUser;
}

const TRANSITION_DURATION = 200;

const TargetUser: React.FunctionComponent<IProps> = ({ user, chatActions }: IProps) => {
  const [isShowHeader, setShowHeader] = useState<boolean>(false);
  const prevUser = useRef<string>(null);
  const classes = useStyles();

  const handleCall = () => {
    chatActions.call(user.name);
  };

  useEffect(() => {
    if (user.name) {
      setShowHeader(false);
      setTimeout(() => {
        prevUser.current = user.name;
        setShowHeader(true);
      }, TRANSITION_DURATION);
    }
  }, [user.name]);

  return (
    <div className={classes.selectedUserWrapper}>
      <Collapse in={isShowHeader} timeout={{ appear: 0, enter: TRANSITION_DURATION, exit: TRANSITION_DURATION }}>
        <div className={classes.selectedUser}>
          {isShowHeader ? user.name : prevUser.current}
          <span className={classes.status}>Online</span>
          {!user.isGroup && prevUser.current === user.name && (
            <IconButton className={classes.call} onClick={handleCall}>
              <Call />
            </IconButton>
          )}
        </div>
      </Collapse>
    </div>
  );
};

export { TargetUser };
