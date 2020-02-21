import React, { useState, useEffect } from 'react';
import { getWebSocketHandler } from './ws';
import { Redirect } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Send from '@material-ui/icons/Send';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      position: 'relative',
      height: '100vh',
    },
    messageArea: {
      position: 'relative',
      maxHeight: 'calc(100vh - 50px)',
      overflowY: 'auto',
    },
    input: {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      height: '60px',
      bottom: '0',
      width: '100%',
    },
  }),
);

interface IIncomingMessages {
  userName: string;
  body: string;
  timestamp: string;
  time: string;
}

const ChatRoom = () => {
  const [receivedMessage, onChangeReceivedMessage] = useState<IIncomingMessages[]>([]);
  const [message, onChangeMessage] = useState<string>('');
  const classes = useStyles();

  useEffect(() => {
    return () => {
      getWebSocketHandler().closeConnection();
    };
  }, []);

  const handleReceiveMessage = (ev: MessageEvent) => {
    const newMessages = receivedMessage.concat(JSON.parse(ev.data));
    onChangeReceivedMessage(newMessages);
  };

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
    getWebSocketHandler().postMessage(message);
    onChangeMessage('');
  };

  if (getWebSocketHandler().isClosed()) {
    return <Redirect to='/' />;
  }
  return (
    <Container maxWidth='md'>
      <div className={classes.wrapper}>
        <div className={classes.messageArea}>
          Messages:
          {receivedMessage.map(msg => (
            <div key={msg.timestamp}>
              <p>From: {msg.userName}</p>
              <div>Message: {msg.body}</div>
              <p>Time: {msg.time}</p>
            </div>
          ))}
        </div>
        <form className={classes.input} onSubmit={handleSendMessage}>
          <TextField onChange={handleMessageChange} value={message} variant='filled' fullWidth autoFocus />
          <IconButton type='submit'>
            <Send />
          </IconButton>
        </form>
      </div>
    </Container>
  );
};

export { ChatRoom };
