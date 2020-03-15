import React, { useState, useEffect, useRef } from 'react';
import TextField from '@material-ui/core/TextField';
import Send from '@material-ui/icons/Send';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import { ChatActions } from 'Redux/Actions/ChatActions';
import { IUser } from 'Models';
import { useStyles } from './styles';

interface IProps {
  chatActions: ChatActions;
  activeUsers: IUser[];
  targetUser: string;
}

const MessageInput: React.FunctionComponent<IProps> = ({ activeUsers, chatActions, targetUser }: IProps) => {
  const [message, onChangeMessage] = useState<string>('');
  const messageInputRef = useRef<HTMLInputElement>(null);
  const classes = useStyles();

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChangeMessage(e.target.value);
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    if (document.activeElement !== messageInputRef.current) {
      messageInputRef.current?.focus();
    }
    e.preventDefault();
    if (!message.trim()) return;
    const isGroup = activeUsers.find(user => user.name === targetUser)?.isGroup;
    chatActions.postMessage(targetUser, message, isGroup);
    onChangeMessage('');
  };

  useEffect(() => {
    const handleKeyDown = () => {
      if (document.activeElement !== messageInputRef.current) {
        messageInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <form onSubmit={handleSendMessage}>
      <TextField
        inputRef={messageInputRef}
        className={classes.messageInput}
        onChange={handleMessageChange}
        value={message}
        variant='outlined'
        fullWidth
        autoFocus
        placeholder='Сообщение...'
        InputProps={{
          endAdornment: (
            <InputAdornment position='end'>
              <IconButton type='submit' edge='end' className={classes.sendIcon}>
                <Send />
              </IconButton>
            </InputAdornment>
          ),
          classes: {
            root: classes.innerInput,
            focused: classes.fieldFocused,
            notchedOutline: classes.notchedOutline,
          },
        }}
      />
    </form>
  );
};
export { MessageInput };
