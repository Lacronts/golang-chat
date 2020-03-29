import React, { useState, useEffect, useCallback } from 'react';
import throttle from 'lodash-es/throttle';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { useSwipeable, EventData } from 'react-swipeable';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import { Messages } from 'Components/Messages/Messages';
import { IAppState, IUser } from 'Models';
import { ChatActions } from 'Redux/Actions/ChatActions';
import { Users } from 'Components/Users/Users';
import { Menu } from 'Components/Menu/Menu';
import { useStyles } from './styles';
import { TargetUser } from 'Components/TargetUser/TargetUser';
import { MessageInput } from 'Components/MessageInput/MessageInput';
import { CallScreen } from 'Components/CallScreen';

interface IStateProps {
  targetUser: string;
  userName: string;
  activeUsers: IUser[];
  isOpenMenu: boolean;
  caller: string;
  callInProgress: boolean;
}

interface IDispatchProps {
  chatActions: ChatActions;
}

type TProps = IStateProps & IDispatchProps;

const ChatRoomComponent: React.FunctionComponent<TProps> = ({
  userName,
  chatActions,
  activeUsers,
  targetUser,
  isOpenMenu,
  caller,
  callInProgress,
}: TProps) => {
  const [height, setScreenHeight] = useState<number>(window.innerHeight);
  const classes = useStyles();

  const handleScreenHeight = throttle(() => {
    setScreenHeight(window.innerHeight);
  }, 75);

  const handleCloseUserMenu = () => {
    isOpenMenu && chatActions.closeMenu();
  };

  const handleSwipeLeft = (data: EventData) => {
    if (data.deltaX > 50) {
      handleCloseUserMenu();
    }
  };

  const swipeHandlers = useSwipeable({ onSwipedLeft: handleSwipeLeft });

  const getActiveUser = useCallback((activeUsers: IUser[]) => activeUsers.find(user => user.name === targetUser), [targetUser]);

  useEffect(() => {
    return () => chatActions.closeConnection();
  }, [chatActions]);

  useEffect(() => {
    window.addEventListener('resize', handleScreenHeight);
    return () => window.removeEventListener('resize', handleScreenHeight);
  }, [handleScreenHeight]);

  return (
    <Container {...swipeHandlers} maxWidth='lg' disableGutters style={{ height }} className={classes.container}>
      <CallScreen chatActions={chatActions} caller={caller} callInProgress={callInProgress} />
      <Menu chatActions={chatActions} activeUsers={activeUsers} />
      <Paper className={classes.wrapper} elevation={10}>
        <Users activeUsers={activeUsers} chatActions={chatActions} targetUser={targetUser} isOpenMenu={isOpenMenu} />
        {targetUser ? (
          <div className={classes.chat}>
            <TargetUser user={getActiveUser(activeUsers)} chatActions={chatActions} />
            <Messages activeUsers={activeUsers} targetUser={targetUser} userName={userName} />
            <MessageInput activeUsers={activeUsers} chatActions={chatActions} targetUser={targetUser} />
          </div>
        ) : (
          <div className={classes.noUserSelected} onClick={handleCloseUserMenu}>
            User must be selected
          </div>
        )}
      </Paper>
    </Container>
  );
};

const mapStateToProps = ({ chat: { userName, activeUsers, targetUser, isOpenMenu, caller, callInProgress } }: IAppState): IStateProps => {
  return {
    targetUser,
    userName,
    activeUsers,
    isOpenMenu,
    caller,
    callInProgress,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  chatActions: new ChatActions(dispatch),
});

export const ChatRoom = connect<IStateProps, IDispatchProps, {}, IAppState>(mapStateToProps, mapDispatchToProps)(ChatRoomComponent);
