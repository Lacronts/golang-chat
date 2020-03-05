import React, { useCallback, useState, useRef, useEffect } from 'react';
import throttle from 'lodash-es/throttle';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Send from '@material-ui/icons/Send';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import InputAdornment from '@material-ui/core/InputAdornment';
import { Message } from 'Message';
import { IAppState, IUser, IIncomingMessages } from 'Models';
import { ChatActions } from 'Redux/Actions/ChatActions';
import { Users } from 'Users';

interface IStateProps {
  targetUser: string;
  userName: string;
  activeUsers: IUser[];
}

interface IDispatchProps {
  chatActions: ChatActions;
}

type TProps = IStateProps & IDispatchProps;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      display: 'flex',
      height: '100%',
    },
    chatWrapper: {
      position: 'relative',
      flexGrow: 1,
    },
    messageArea: {
      position: 'absolute',
      width: '100%',
      maxHeight: '100%',
      height: 'auto',
      bottom: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: `0 ${theme.spacing(2)}px`,
      [`&.scroll-disabled`]: {
        overflowY: 'hidden',
      },
    },
    messageInput: {
      width: '100%',
      borderRadius: '0',
      '& fieldset': {
        borderRadius: 0,
        borderLeft: 0,
        borderRight: 0,
        borderBottom: 0,
      },
    },
    innerInput: {
      fontSize: '12px',
    },
    chat: {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column',
    },
    noUserSelected: {
      flexGrow: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '20px',
      color: theme.palette.action.disabled,
    },
  }),
);

const ChatRoomComponent: React.FunctionComponent<TProps> = ({ userName, chatActions, activeUsers, targetUser }: TProps) => {
  const [message, onChangeMessage] = useState<string>('');
  const [height, setScreenHeight] = useState<number>(window.innerHeight);
  const [isScrollEnabled, onToggleScroll] = useState<boolean>(false);
  const scrollInterval = useRef<NodeJS.Timeout>(null);
  const classes = useStyles();
  const messageAreaRef = useRef<HTMLDivElement>(null);
  const messages: IIncomingMessages[] = activeUsers.find(el => el.name === targetUser)?.messages ?? [];

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChangeMessage(e.target.value);
  };

  const disableScroll = () => {
    if (scrollInterval.current) {
      clearTimeout(scrollInterval.current);
    }
    onToggleScroll(false);
  };

  const enableScroll = () => {
    scrollInterval.current = setTimeout(() => onToggleScroll(true), 75);
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    disableScroll();
    e.preventDefault();
    if (!message.trim()) return;
    const isGroup = activeUsers.find(user => user.name === targetUser)?.isGroup;
    chatActions.postMessage(targetUser, message, isGroup);
    onChangeMessage('');
  };

  const updateScrollPosition = useCallback(() => {
    const ref = messageAreaRef.current;
    const areaHeight = ref?.scrollHeight;
    const clientHeight = ref?.clientHeight;
    if (areaHeight > clientHeight) {
      ref.scrollTop = areaHeight;
      enableScroll();
    }
  }, [messageAreaRef]);

  const handleScreenHeight = throttle(() => {
    setScreenHeight(window.innerHeight);
  }, 75);

  useEffect(() => {
    updateScrollPosition();
  }, [messages, updateScrollPosition]);

  useEffect(() => {
    return () => chatActions.closeConnection();
  }, [chatActions]);

  useEffect(() => {
    window.addEventListener('resize', handleScreenHeight);
    return () => window.removeEventListener('resize', handleScreenHeight);
  }, [handleScreenHeight]);

  return (
    <Container maxWidth='lg' disableGutters style={{ height }}>
      <Paper className={classes.wrapper} elevation={4}>
        <Users />
        {targetUser ? (
          <div className={classes.chat}>
            <div className={classes.chatWrapper}>
              <div className={`${classes.messageArea} ${isScrollEnabled ? '' : 'scroll-disabled'}`} ref={messageAreaRef}>
                {messages.map(msg => (
                  <Message key={msg.timestamp} data={msg} currentUserID={userName} />
                ))}
              </div>
            </div>
            <form onSubmit={handleSendMessage}>
              <TextField
                className={classes.messageInput}
                onChange={handleMessageChange}
                value={message}
                variant='outlined'
                fullWidth
                autoFocus
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton type='submit' edge='end' color='primary'>
                        <Send />
                      </IconButton>
                    </InputAdornment>
                  ),
                  classes: {
                    root: classes.innerInput,
                  },
                }}
              />
            </form>
          </div>
        ) : (
          <div className={classes.noUserSelected}>User must be selected</div>
        )}
      </Paper>
    </Container>
  );
};

const mapStateToProps = ({ chat: { userName, activeUsers, targetUser } }: IAppState): IStateProps => {
  return {
    targetUser,
    userName,
    activeUsers,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  chatActions: new ChatActions(dispatch),
});

export const ChatRoom = connect<IStateProps, IDispatchProps, {}, IAppState>(mapStateToProps, mapDispatchToProps)(ChatRoomComponent);
