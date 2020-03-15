import React, { useState, useRef, useEffect } from 'react';
import Collapse from '@material-ui/core/Collapse';
import { useStyles } from './styles';

interface IProps {
  user: string;
}

const TRANSITION_DURATION = 200;

const TargetUser: React.FunctionComponent<IProps> = ({ user }: IProps) => {
  const [isShowHeader, setShowHeader] = useState<boolean>(false);
  const prevUser = useRef<string>(null);
  const classes = useStyles();

  useEffect(() => {
    if (user) {
      setShowHeader(false);
      setTimeout(() => {
        prevUser.current = user;
        setShowHeader(true);
      }, TRANSITION_DURATION);
    }
  }, [user]);

  return (
    <div className={classes.selectedUserWrapper}>
      <Collapse in={isShowHeader} timeout={{ appear: 0, enter: TRANSITION_DURATION, exit: TRANSITION_DURATION }}>
        <div className={classes.selectedUser}>
          {isShowHeader ? user : prevUser.current} <span className={classes.status}>Online</span>
        </div>
      </Collapse>
    </div>
  );
};

export { TargetUser };
