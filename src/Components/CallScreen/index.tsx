import React, { useRef, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import PhoneCallback from '@material-ui/icons/PhoneCallback';
import CallEnd from '@material-ui/icons/CallEnd';
import { ChatActions } from 'Redux/Actions/ChatActions';
import { useStyles } from './styles';
import IconButton from '@material-ui/core/IconButton';

interface IProps {
  chatActions: ChatActions;
  caller: string;
  callInProgress: boolean;
}

const CallScreen: React.SFC<IProps> = ({ chatActions, caller, callInProgress }: IProps) => {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const classes = useStyles({ isVisible: callInProgress });

  useEffect(() => {
    const localVideoEl = localRef.current;
    const remoteVideoEl = remoteRef.current;
    chatActions.setVideoRefs(localVideoEl, remoteVideoEl);
  }, [chatActions]);

  return (
    <>
      {caller && (
        <Paper elevation={10} className={classes.callWrapper}>
          <div className={classes.callInnerWrapper}>
            <div className={classes.title}>Incoming call</div>
            <div className={classes.userName}>{caller}</div>
            <IconButton className={classes.acceptCallIco} onClick={chatActions.answerToCall}>
              <PhoneCallback fontSize='large' />
            </IconButton>
            <IconButton className={classes.declineCallIco} onClick={chatActions.dropCall}>
              <CallEnd fontSize='large' />
            </IconButton>
          </div>
        </Paper>
      )}
      <div className={classes.videos}>
        <video ref={localRef} className={classes.localVideo} autoPlay playsInline />
        <video ref={remoteRef} className={classes.remoteVideo} autoPlay playsInline />
      </div>
      {callInProgress && <div className={classes.backdrop} />}
    </>
  );
};

export { CallScreen };