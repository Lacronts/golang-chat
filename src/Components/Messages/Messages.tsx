import React, { useEffect, useRef } from 'react';
import SimpleBar from 'simplebar-react';
import { Message } from 'Components/Message/Message';
import { IIncomingMessages, IUser } from 'Models';
import { toggleScrollBar } from 'Utils';
import { useStyles } from './styles';

interface IProps {
  activeUsers: IUser[];
  targetUser: string;
  userName: string;
}

const Messages: React.SFC<IProps> = ({ activeUsers, targetUser, userName }: IProps) => {
  const messageAreaRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef(null);
  const messages: IIncomingMessages[] = activeUsers.find(el => el.name === targetUser)?.messages ?? [];
  const classes = useStyles();

  useEffect(() => {
    const elementHeight = messageAreaRef.current?.scrollHeight;
    const areaHeight = messageAreaRef.current?.clientHeight;
    if (elementHeight > areaHeight) {
      toggleScrollBar(false);
      messageAreaRef.current.scrollTop = elementHeight;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setTimeout(() => {
        toggleScrollBar(true);
      }, 400);
    }
  }, [messages]);

  return (
    <div className={classes.chatWrapper}>
      <div className={classes.messageArea}>
        <SimpleBar className={classes.scrollbar} scrollableNodeProps={{ ref: messageAreaRef }} timeout={200}>
          {messages.map(msg => (
            <Message key={msg.timestamp} data={msg} currentUserID={userName} />
          ))}
        </SimpleBar>
      </div>
    </div>
  );
};

export { Messages };
