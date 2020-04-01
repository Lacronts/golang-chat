import React, { useRef, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import Paper from '@material-ui/core/Paper';
import PhoneCallback from '@material-ui/icons/PhoneCallback';
import CallEnd from '@material-ui/icons/CallEnd';
import IconButton from '@material-ui/core/IconButton';
import FlipCamera from '@material-ui/icons/FlipCameraAndroid';
import { ChatActions } from 'Redux/Actions/ChatActions';
import { getVideoDevices } from 'Utils';
import { useStyles } from './styles';

interface IProps {
  chatActions: ChatActions;
  caller: string;
  callInProgress: boolean;
}

const CallScreen: React.FunctionComponent<IProps> = ({ chatActions, caller, callInProgress }: IProps) => {
  const [countVideoDevices, setCountVideoDevices] = useState<number>(0);
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const classes = useStyles({ isVisible: callInProgress });
  const hasFacingMode = navigator.mediaDevices?.getSupportedConstraints()?.facingMode;

  useEffect(() => {
    const localVideoEl = localRef.current;
    const remoteVideoEl = remoteRef.current;
    chatActions.setVideoRefs(localVideoEl, remoteVideoEl);
    getVideoDevices().then(vd => setCountVideoDevices(vd.length));
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

      <div className={classes.wrapper}>
        <div className={classes.videos}>
          <Draggable bounds='parent'>
            <video ref={localRef} className={classes.localVideo} muted playsInline />
          </Draggable>
          <video ref={remoteRef} className={classes.remoteVideo} autoPlay playsInline />
        </div>

        <div className={classes.controlsWrapper}>
          <div className={classes.controls}>
            {countVideoDevices > 1 && hasFacingMode && (
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
        </div>
      </div>
      {callInProgress && <div className={classes.backdrop} />}
    </>
  );
};

export { CallScreen };
