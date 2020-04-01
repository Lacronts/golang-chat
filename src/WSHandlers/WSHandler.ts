import { Dispatch } from 'redux';
import { ChatActionTypes } from 'Redux/Actions/ChatActionTypes';
import { ConnectionActionTypes } from 'Redux/Actions/ConnectionActionTypes';
import { IAppState, INewUser, IIncomingMessages, IUser, IIncomingData } from 'Models';
import { EReceivedDataKey, EReasonDropCall } from 'Enums';
import { API_ADDRESS_WS } from 'Redux/Services/consts';
import { concatMessages } from 'WSHandlers/Utils';

type TListenType = 'offer' | 'answer';

enum ECamMode {
  FRONT = 'user',
  BACK = 'environment',
}

const configuration: RTCConfiguration = { iceServers: [{ urls: 'stun:stun4.l.google.com:19302' }] };

class WSHandler {
  private conn: WebSocket;
  private pc: RTCPeerConnection;
  private localVideoEl: HTMLVideoElement;
  private remoteVideoEl: HTMLVideoElement;
  private target: string;
  private outCallAudio: HTMLAudioElement = new Audio('assets/outCall.mp3');
  private incCallAudio: HTMLAudioElement = new Audio('assets/incCall.mp3');
  private localStream: MediaStream;
  private remoteStream: MediaStream;
  private dropInterval: NodeJS.Timeout;
  private answerToCall: () => void;
  private dropCall: (reason: EReasonDropCall) => void;
  private userMediaConstraints: any = {
    video: {
      facingMode: ECamMode.FRONT,
    },
    audio: {
      mandatory: {
        googEchoCancellation: true,
        googNoiseSuppression: true,
        googHighpassFilter: true,
      },
    },
  };

  private static instance: WSHandler;

  private constructor(private dispatch: Dispatch) {}

  public static getInstance(dispatch: Dispatch): WSHandler {
    if (!WSHandler.instance) {
      WSHandler.instance = new WSHandler(dispatch);
    }

    return WSHandler.instance;
  }

  private startListening = () => {
    console.info('...start listening');
    this.conn.addEventListener('close', this.onClose);
    this.conn.addEventListener('error', this.onError);
    this.conn.addEventListener('message', this.onReceiveData);
  };

  private stopListening = () => {
    console.info('...stop listening');
    this.conn.removeEventListener('close', this.onClose);
    this.conn.removeEventListener('error', this.onError);
    this.conn.removeEventListener('message', this.onReceiveData);
  };

  private onClose = () => {
    if (this.conn.readyState === this.conn.CLOSED) {
      this.stopListening();
      this.dispatch({ type: ConnectionActionTypes.CLOSE_CONNECTION });
      console.info('connection closed');
    }
  };

  private onError = (ev: Event) => {
    this.stopListening();
    console.error('An error occured', ev);
  };

  private onReceiveData = (ev: MessageEvent) => {
    this.dispatch<any>((_, getState: () => IAppState) => {
      const { activeUsers, userName, targetUser } = getState().chat;
      const JSONData = JSON.parse(ev.data);
      switch (JSONData.type) {
        case EReceivedDataKey.MESSAGE_DATA: {
          const newMessage = JSONData.data as IIncomingMessages;
          if (newMessage.groupName) {
            const newUsers = concatMessages(activeUsers, newMessage.groupName, newMessage, targetUser === newMessage.groupName);
            this.dispatch({ type: ChatActionTypes.UPDATE_ACTIVE_USERS, payload: newUsers });
          } else if (userName === newMessage.from) {
            const newUsers = concatMessages(activeUsers, targetUser, newMessage, true);
            this.dispatch({ type: ChatActionTypes.UPDATE_ACTIVE_USERS, payload: newUsers });
          } else {
            const newUsers = concatMessages(activeUsers, newMessage.from, newMessage, targetUser === newMessage.from);
            this.dispatch({ type: ChatActionTypes.UPDATE_ACTIVE_USERS, payload: newUsers });
          }
          break;
        }
        case EReceivedDataKey.ALL_USERS_NOTIF: {
          const data = JSONData.data as INewUser[];
          if (data) {
            const newActiveUsers: IUser[] = data.map(el => ({ name: el.userName, color: el.color, isGroup: false, messages: [] }));
            this.dispatch({ type: ChatActionTypes.UPDATE_ACTIVE_USERS, payload: [...activeUsers, ...newActiveUsers] });
          }
          break;
        }
        case EReceivedDataKey.NEW_USER_NOTIF: {
          const data = JSONData.data as INewUser;
          const newUser: IUser = {
            name: data.userName,
            color: data.color,
            messages: [],
            isGroup: false,
          };
          const newActiveUsers = [...activeUsers, newUser];
          this.dispatch({ type: ChatActionTypes.UPDATE_ACTIVE_USERS, payload: newActiveUsers });
          break;
        }
        case EReceivedDataKey.REMOVE_USER_NOTIF: {
          const name = JSONData.data as string;
          if (this.target === name) {
            this.handleCancelCall();
          }
          const newActiveUsers = activeUsers.filter(user => user.name !== name);
          if (targetUser === name) {
            this.dispatch({ type: ChatActionTypes.SELECT_TARGET_USER, payload: { targetUser: null, activeUsers: newActiveUsers } });
          } else {
            this.dispatch({ type: ChatActionTypes.UPDATE_ACTIVE_USERS, payload: newActiveUsers });
          }
          break;
        }
        case EReceivedDataKey.OFFER: {
          const data = JSONData as IIncomingData;
          this.createAnswer(data);
          break;
        }
        case EReceivedDataKey.ANSWER: {
          const data = JSONData as IIncomingData;
          this.getAnswer(data);
          break;
        }
        case EReceivedDataKey.CANDIDATE: {
          const data = JSONData as IIncomingData;
          this.handleAddIceCandidate(data);
          break;
        }
        case EReceivedDataKey.CANCEL_CALL: {
          this.handleCancelCall();
          break;
        }
        case 'ping': {
          console.log('ping');
        }
      }
    });
  };

  public init = (name: string): Promise<WebSocket | ErrorEvent> => {
    return new Promise((resolve, reject) => {
      const hostName = window.location.hostname;
      if (hostName.indexOf('heroku') !== -1) {
        this.conn = new WebSocket(`wss://${hostName}/in-room/${name}`);
      } else {
        this.conn = new WebSocket(`${API_ADDRESS_WS}/in-room/${name}`);
      }
      this.conn.onopen = () => {
        console.info('connection established');
        this.startListening();
        this.dispatch({ type: ConnectionActionTypes.OPEN_CONNECTION });
        resolve(this.conn);
      };
      this.conn.onerror = err => {
        console.error('An error occured', err);
        reject(err);
      };
    });
  };

  private stopAudio = () => {
    if (!this.incCallAudio.paused) {
      this.incCallAudio.pause();
      this.incCallAudio.currentTime = 0;
    }
    if (!this.outCallAudio.paused) {
      this.outCallAudio.pause();
      this.outCallAudio.currentTime = 0;
    }
  };

  public handeAnswerToCall = () => {
    this.dispatch({ type: ChatActionTypes.INCOMING_CALL, payload: null });
    this.answerToCall();
  };

  public handleDropCall = (reason?: EReasonDropCall) => {
    this.handleCancelCall();
    this.dropCall?.(reason || EReasonDropCall.CANCEL);
  };

  public handleCancelCall = () => {
    this.dispatch<any>((dispatch: Dispatch, getState: () => IAppState) => {
      const { callInProgress, caller } = getState().chat;
      if (callInProgress || caller) {
        this.stopAudio();
        this.localVideoEl.srcObject = null;
        this.remoteVideoEl.srcObject = null;
        this.localStream?.getTracks().forEach(track => track.stop());
        this.stopListeningRTC();
        this.postMessage({ target: this.target, type: EReceivedDataKey.CANCEL_CALL });
        dispatch({ type: ChatActionTypes.SET_CALL_PROGRESS, payload: false });
        dispatch({ type: ChatActionTypes.INCOMING_CALL, payload: null });
      }
    });
  };

  private waitUserAction = (ms: number) => {
    this.dispatch({ type: ChatActionTypes.INCOMING_CALL, payload: this.target });
    return new Promise((answerToCall, dropCall) => {
      this.answerToCall = answerToCall;
      this.dropCall = dropCall;
      this.dropInterval = setTimeout(() => {
        this.handleDropCall(EReasonDropCall.TIMEOUT);
      }, ms);
    });
  };

  private createAnswer = async ({ data, author }: IIncomingData) => {
    try {
      await this.incCallAudio.play();
      this.target = author;
      this.pc = new RTCPeerConnection(configuration);
      this.startListeningRTC('answer');
      await this.pc.setRemoteDescription(data);
      await this.waitUserAction(10000);
      this.stopAudio();
      clearInterval(this.dropInterval);
      await this.startLocalStream();
      await this.pc.setLocalDescription(
        await this.pc.createAnswer({ offerToReceiveVideo: true, offerToReceiveAudio: true, voiceActivityDetection: true }),
      );
      this.postMessage({ target: this.target, data: this.pc.localDescription, type: EReceivedDataKey.ANSWER });
      this.dispatch({ type: ChatActionTypes.SET_CALL_PROGRESS, payload: true });
    } catch (err) {
      if (err in EReasonDropCall) {
        this.postMessage({ target: this.target, type: EReceivedDataKey.CANCEL_CALL });
      }
    }
  };

  private getAnswer = async ({ data }: IIncomingData) => {
    try {
      this.stopAudio();
      await this.pc.setRemoteDescription(data);
      this.dispatch({ type: ChatActionTypes.SET_CALL_PROGRESS, payload: true });
    } catch (err) {
      console.error(err);
    }
  };

  public setVideoRefs = (localVideoEl: HTMLVideoElement, remoteVideoEl: HTMLVideoElement) => {
    this.localVideoEl = localVideoEl;
    this.remoteVideoEl = remoteVideoEl;
  };

  private startListeningRTC = (type: TListenType) => {
    if (type === 'offer') {
      this.pc.addEventListener('negotiationneeded', this.handleNegotiateEndeed);
    }
    this.pc.addEventListener('icecandidate', this.handleSendIceCandidate);
    this.pc.addEventListener('track', this.getRemoteTrack);
  };

  private stopListeningRTC = () => {
    this.pc.removeEventListener('negotiationneeded', this.handleNegotiateEndeed);
    this.pc.removeEventListener('icecandidate', this.handleSendIceCandidate);
    this.pc.removeEventListener('track', this.getRemoteTrack);
  };

  private handleSendIceCandidate = (ev: RTCPeerConnectionIceEvent) => {
    if (ev.candidate) {
      this.postMessage({ target: this.target, type: EReceivedDataKey.CANDIDATE, data: ev.candidate });
    }
  };

  private handleAddIceCandidate = async ({ data }: IIncomingData) => {
    try {
      if (this.pc) {
        await this.pc.addIceCandidate(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  private getRemoteTrack = async (ev: RTCTrackEvent) => {
    if (this.remoteVideoEl.srcObject !== ev.streams[0]) {
      this.remoteVideoEl.volume = 0.9;
      this.remoteVideoEl.srcObject = ev.streams[0];
    }
  };

  private handleNegotiateEndeed = async () => {
    if (this.pc.connectionState !== 'connected') {
      try {
        await this.pc.setLocalDescription(
          await this.pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true, voiceActivityDetection: true }),
        );
        this.postMessage({ data: this.pc.localDescription, target: this.target, type: EReceivedDataKey.OFFER });
      } catch (err) {
        console.error(err);
      }
    }
  };

  private startLocalStream = async () => {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(this.userMediaConstraints);
      const tracks = this.localStream.getTracks();
      tracks.forEach(track => this.pc.addTrack(track, this.localStream));
      const localVideoStream = new MediaStream();
      const localVideTrack = this.localStream.getVideoTracks()[0];
      localVideoStream.addTrack(localVideTrack);
      this.localVideoEl.srcObject = localVideoStream;
      this.localVideoEl.volume = 0;
      await this.localVideoEl.play();
    } catch (err) {
      console.error('local stream error:', err);
    }
  };

  public swapLocalCamera = async () => {
    try {
      this.localStream.getTracks().forEach(track => track.stop());
      if (this.userMediaConstraints.video.facingMode === ECamMode.FRONT) {
        this.userMediaConstraints.video.facingMode = ECamMode.BACK;
      } else {
        this.userMediaConstraints.video.facingMode = ECamMode.FRONT;
      }
      this.localStream = await navigator.mediaDevices.getUserMedia(this.userMediaConstraints);
      const tracks = this.localStream.getTracks();
      tracks.forEach(async track => {
        const senders = this.pc.getSenders();
        const curSender = senders.find(s => s.track.kind === track.kind);
        await curSender.replaceTrack(track);
      });
      this.localVideoEl.srcObject = this.localStream;
      await this.localVideoEl.play();
    } catch (err) {
      console.error('swapr cams error:', err);
    }
  };

  public startCall = async (target: string) => {
    try {
      await this.outCallAudio.play();
      this.target = target;
      this.pc = new RTCPeerConnection(configuration);
      this.startLocalStream();
      this.startListeningRTC('offer');
    } catch (err) {
      this.stopListeningRTC();
      console.error(err);
    }
  };

  public postMessage = (message: object) => {
    this.conn?.send(JSON.stringify(message));
  };

  public closeConnection = () => {
    this.conn?.close();
  };

  public isClosed = () => {
    if (this.conn) {
      return this.conn.CLOSED === this.conn.readyState;
    }
    return true;
  };
}

export { WSHandler };
