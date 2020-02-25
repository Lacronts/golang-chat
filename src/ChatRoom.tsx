import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getWebSocketHandler } from './ws';
import { Redirect } from 'react-router-dom';
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
import { IIncomingMessages } from 'Models';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      position: 'relative',
      height: '100vh',
    },
    messageArea: {
      position: 'relative',
      maxHeight: 'calc(100vh - 56px)',
      overflowY: 'auto',
      padding: `0 ${theme.spacing(2)}px`,
    },
    messageInput: {
      position: 'absolute',
      bottom: '0',
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
  }),
);

const ChatRoom: React.FunctionComponent = () => {
  const [receivedMessage, onChangeReceivedMessage] = useState<IIncomingMessages[]>([]);
  const [message, onChangeMessage] = useState<string>('');
  const classes = useStyles();
  const messageAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      getWebSocketHandler().closeConnection();
    };
  }, []);

  const handleReceiveMessage = useCallback(
    (ev: MessageEvent) => {
      const newMessages = receivedMessage.concat(JSON.parse(ev.data));
      onChangeReceivedMessage(newMessages);
    },
    [receivedMessage],
  );

  useEffect(() => {
    getWebSocketHandler().conn?.addEventListener('message', handleReceiveMessage);
    return () => {
      getWebSocketHandler().conn?.removeEventListener('message', handleReceiveMessage);
    };
  }, [handleReceiveMessage]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChangeMessage(e.target.value);
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;
    getWebSocketHandler().postMessage(message);
    onChangeMessage('');
  };

  if (getWebSocketHandler().isClosed()) {
    return <Redirect to='/' />;
  }

  return (
    <Container maxWidth='md' disableGutters>
      <Paper className={classes.wrapper} elevation={4}>
        <div className={classes.messageArea} ref={messageAreaRef}>
          {receivedMessage.map(msg => (
            <Message key={msg.timestamp} msg={msg} currentUserID={getWebSocketHandler().getUserID()} areaRef={messageAreaRef} />
          ))}
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
      </Paper>
    </Container>
  );
};

export { ChatRoom };
