import React, { useEffect, useRef, useState, useCallback } from 'react';
import Paper from '@material-ui/core/Paper';
import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { IIncomingMessages } from 'Models';

interface IUseStylesProps {
  userColor: string;
  isCurrent: boolean;
  messageBlockWidth: number;
}

const WIDTH_FOR_TOGGLE_TIME = 250;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    row: {
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
      const isWide = props.messageBlockWidth > WIDTH_FOR_TOGGLE_TIME;
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
  areaRef: React.MutableRefObject<HTMLDivElement>;
}

const Message: React.FunctionComponent<IProps> = ({ msg, currentUserID, areaRef }: IProps) => {
  const [messageBlockWidth, setMessageBlockWidth] = useState<number>(0);
  const isCurrent = msg.userName === currentUserID;
  const classes = useStyles({ userColor: msg.userColor, isCurrent, messageBlockWidth });
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    calculateMessageWidth();
  }, []);

  const refreshScrollPosition = useCallback(() => {
    const ref = areaRef.current;
    const areaHeight = ref?.scrollHeight;
    const screenHeight = ref?.getBoundingClientRect().height;
    if (areaHeight > screenHeight) {
      ref.scrollTo({ top: areaHeight });
    }
  }, [areaRef]);

  useEffect(() => {
    refreshScrollPosition();
  }, [refreshScrollPosition, messageBlockWidth]);

  const calculateMessageWidth = () => {
    const messageWidth = wrapperRef.current?.getBoundingClientRect().width;
    setMessageBlockWidth(messageWidth);
  };

  return (
    <div className={classes.row}>
      <Paper elevation={2} className={classes.messageWrapper} ref={wrapperRef}>
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
