import React, { useRef, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import PhoneCallback from '@material-ui/icons/PhoneCallback';
import CallEnd from '@material-ui/icons/CallEnd';
import IconButton from '@material-ui/core/IconButton';
import FlipCamera from '@material-ui/icons/FlipCameraAndroid';
import { ChatActions } from 'Redux/Actions/ChatActions';
import { useStyles } from './styles';

interface IProps {
  chatActions: ChatActions;
  caller: string;
  callInProgress: boolean;
}

const CallScreen: React.SFC<IProps> = ({ chatActions, caller, callInProgress }: IProps) => {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const classes = useStyles({ isVisible: callInProgress });
  const hasBackCam = navigator.mediaDevices?.getSupportedConstraints()?.facingMode;

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
        <video ref={localRef} className={classes.localVideo} muted playsInline />
        <video ref={remoteRef} className={classes.remoteVideo} autoPlay playsInline />
        {hasBackCam && (
          <IconButton className={classes.flipIco} onClick={chatActions.swapCams}>
            <FlipCamera />
          </IconButton>
        )}
        {callInProgress && (
          <IconButton className={classes.stopCall} onClick={chatActions.dropCall}>
            <CallEnd fontSize='large' />
          </IconButton>
        )}
      </div>
      {callInProgress && <div className={classes.backdrop} />}
    </>
  );
};

export { CallScreen };
