import React from 'react';
import Paper from '@material-ui/core/Paper';
import { IIncomingMessages } from 'Models';
import { useStyles } from './styles';

interface IProps {
  data: IIncomingMessages;
  currentUserID: string;
}

const Message: React.SFC<IProps> = ({ data, currentUserID }: IProps) => {
  const isCurrent = data.from === currentUserID;
  let classes = useStyles({ userColor: data.userColor, isCurrent, textLength: data.message.length });

  return (
    <div className={classes.row}>
      <Paper elevation={2} className={classes.messageWrapper}>
        <div className={classes.user}>{data.from}</div>
        <div className={classes.withTimeWrapper}>
          <div className={classes.message}>{data.message}</div>
          <div className={classes.time}>{data.time.slice(-5)}</div>
        </div>
      </Paper>
    </div>
  );
};

export { Message };
