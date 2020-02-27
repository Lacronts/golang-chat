import React from 'react';
import Paper from '@material-ui/core/Paper';
import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { IIncomingMessages } from 'Models';

interface IUseStylesProps {
  userColor: string;
  isCurrent: boolean;
  textLength: number;
}

const TEXT_LENGTH_FOR_TOGGLE = 30;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    row: {
      position: 'relative',
      display: 'flex',
      padding: theme.spacing(1),
    },
    messageWrapper: (props: IUseStylesProps) => ({
      position: 'relative',
      display: 'inline-block',
      padding: `${theme.spacing(0.5)}px ${theme.spacing(1)}px`,
      borderRadius: '10px',
      maxWidth: '75%',
      marginLeft: props.isCurrent ? 'auto' : null,
    }),
    withTimeWrapper: (props: IUseStylesProps) => {
      const isWide = props.textLength > TEXT_LENGTH_FOR_TOGGLE;
      if (isWide) {
        return null;
      }
      return { display: 'flex', alignItems: 'flex-end' };
    },
    time: {
      fontSize: '8px',
      color: theme.palette.grey[500],
      paddingLeft: theme.spacing(0.5),
      textAlign: 'right',
    },
    user: (props: IUseStylesProps) => ({
      display: props.isCurrent ? 'none' : null,
      fontSize: '10px',
      fontWeight: 'bold',
      fontStyle: 'italic',
      color: `rgb(${props.userColor})`,
    }),
    message: {
      fontSize: '12px',
    },
  }),
);

interface IProps {
  msg: IIncomingMessages;
  currentUserID: string;
}

const Message: React.FunctionComponent<IProps> = ({ msg, currentUserID }: IProps) => {
  const isCurrent = msg.userName === currentUserID;
  let classes = useStyles({ userColor: msg.userColor, isCurrent, textLength: msg.body.length });

  return (
    <div className={classes.row}>
      <Paper elevation={2} className={classes.messageWrapper}>
        <div className={classes.user}>{msg.userName}</div>
        <div className={classes.withTimeWrapper}>
          <div className={classes.message}>{msg.body}</div>
          <div className={classes.time}>{msg.time.slice(-5)}</div>
        </div>
      </Paper>
    </div>
  );
};

export { Message };
