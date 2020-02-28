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
import { IAppState, IIncomingMessages } from 'Models';
import { ChatActions } from 'Redux/Actions/ChatActions';

interface IStateProps {
  userName: string;
  messages: IIncomingMessages[];
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
    users: {
      flexBasis: '300px',
      borderRightWidth: '2px',
      borderRightColor: theme.palette.primary.main,
      borderRightStyle: 'solid',
    },
    chat: {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column',
    },
  }),
);

const ChatRoomComponent: React.FunctionComponent<TProps> = ({ userName, chatActions, messages }: TProps) => {
  const [message, onChangeMessage] = useState<string>('');
  const [height, setScreenHeight] = useState<number>(window.innerHeight);
  const [isScrollEnabled, onToggleScroll] = useState<boolean>(false);
  const scrollInterval = useRef<NodeJS.Timeout>(null);
  const classes = useStyles();
  const messageAreaRef = useRef<HTMLDivElement>(null);

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
    chatActions.postMessage(message);
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
    chatActions.getActiveUsers();
    return () => chatActions.closeConnection();
  }, [chatActions]);

  useEffect(() => {
    window.addEventListener('resize', handleScreenHeight);
    return () => window.removeEventListener('resize', handleScreenHeight);
  }, [handleScreenHeight]);

  return (
    <Container maxWidth='lg' disableGutters style={{ height }}>
      <Paper className={classes.wrapper} elevation={4}>
        <div className={classes.users}>users</div>
        <div className={classes.chat}>
          <div className={classes.chatWrapper}>
            <div className={`${classes.messageArea} ${isScrollEnabled ? '' : 'scroll-disabled'}`} ref={messageAreaRef}>
              {messages.map(msg => (
                <Message key={msg.timestamp} msg={msg} currentUserID={userName} />
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
      </Paper>
    </Container>
  );
};

const mapStateToProps = ({ chat: { userName, messages } }: IAppState): IStateProps => {
  return {
    userName,
    messages,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  chatActions: new ChatActions(dispatch),
});

export const ChatRoom = connect<IStateProps, IDispatchProps, {}, IAppState>(mapStateToProps, mapDispatchToProps)(ChatRoomComponent);
