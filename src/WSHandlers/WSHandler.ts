import { Dispatch } from 'redux';
import { ChatActionTypes } from 'Redux/Actions/ChatActionTypes';
import { ConnectionActionTypes } from 'Redux/Actions/ConnectionActionTypes';
import { IAppState, INewUserResponse, IAllUsersResponse, IIncomingMessages, IUser, IIncomingData } from 'Models';
import { EReceivedDataKey, EReasonDropCall } from 'Enums';
import { API_ADDRESS_WS } from 'Redux/Services/consts';
import { concatMessages } from 'WSHandlers/Utils';

type TListenType = 'offer' | 'answer';

const configuration: RTCConfiguration = { iceServers: [{ urls: 'stun:stun4.l.google.com:19302' }] };

const userMediaConstraints: MediaStreamConstraints = {
  video: true,
  audio: {
    echoCancellation: true,
    autoGainControl: false,
    noiseSuppression: false,
    channelCount: 2,
    latency: 100,
    sampleRate: 44100,
    sampleSize: 16,
  },
};

class WSHandler {
  private conn: WebSocket;
  private pc: RTCPeerConnection;
  private localVideoEl: HTMLVideoElement;
  private remoteVideoEl: HTMLVideoElement;
  private target: string;
  private audio: HTMLAudioElement;
  private localStream: MediaStream;
  private remoteStream: MediaStream;
  private dropInterval: NodeJS.Timeout;
  private answerToCall: () => void;
  private dropCall: (reason: EReasonDropCall) => void;

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
      Object.keys(JSONData).forEach(key => {
        switch (key) {
          case EReceivedDataKey.ALL_USERS_NOTIF: {
            const data = JSONData as IAllUsersResponse;
            if (data.users) {
              const newActiveUsers: IUser[] = data.users.map(el => ({ name: el.userName, color: el.color, isGroup: false, messages: [] }));
              this.dispatch({ type: ChatActionTypes.UPDATE_ACTIVE_USERS, payload: [...activeUsers, ...newActiveUsers] });
            }
            break;
          }
          case EReceivedDataKey.MESSAGE: {
            const newMessage = JSONData[EReceivedDataKey.MESSAGE] as IIncomingMessages;
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
          case EReceivedDataKey.NEW_USER_NOTIF: {
            const data = JSONData as INewUserResponse;
            const newUser: IUser = {
              name: data.newUser.userName,
              color: data.newUser.color,
              messages: [],
              isGroup: false,
            };
            const newActiveUsers = [...activeUsers, newUser];
            this.dispatch({ type: ChatActionTypes.UPDATE_ACTIVE_USERS, payload: newActiveUsers });
            break;
          }
          case EReceivedDataKey.REMOVE_USER_NOTIF: {
            const name = JSONData[EReceivedDataKey.REMOVE_USER_NOTIF] as string;
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
        }
      });

      switch (JSONData.type) {
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
    this.audio.pause();
    this.audio.currentTime = 0;
  };

  public handeAnswerToCall = () => {
    this.dispatch({ type: ChatActionTypes.INCOMING_CALL, payload: null });
    this.answerToCall();
  };

  public handleDropCall = (reason?: EReasonDropCall) => {
    this.handleCancelCall();
    this.dropCall(reason || EReasonDropCall.CANCEL);
    this.dispatch({ type: ChatActionTypes.INCOMING_CALL, payload: null });
  };

  public handleCancelCall = () => {
    this.stopAudio();
    this.pc.close();
    this.localVideoEl.srcObject = null;
    this.remoteVideoEl.srcObject = null;
    this.localStream?.getTracks().forEach(track => track.stop());
    this.stopListeningRTC();
    this.dispatch({ type: ChatActionTypes.SET_CALL_PROGRESS, payload: false });
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
      this.audio = new Audio('assets/incCall.mp3');
      this.audio.load();
      this.target = author;
      this.pc = new RTCPeerConnection(configuration);
      await this.audio.play();
      this.startListeningRTC('answer');
      await this.pc.setRemoteDescription(data);
      await this.waitUserAction(10000);
      this.stopAudio();
      clearInterval(this.dropInterval);
      const stream = await navigator.mediaDevices.getUserMedia(userMediaConstraints);
      const tracks = stream.getTracks();
      tracks.forEach(track => this.pc.addTrack(track, stream));
      await this.pc.setLocalDescription(await this.pc.createAnswer());
      this.postMessage({ target: this.target, data: this.pc.localDescription, type: EReceivedDataKey.ANSWER });
      this.localVideoEl.srcObject = stream;
      await this.localVideoEl.play();
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
      await this.pc.addIceCandidate(data);
    } catch (err) {
      console.error(err);
    }
  };

  private getRemoteTrack = async (ev: RTCTrackEvent) => {
    this.remoteStream = new MediaStream();
    if (ev.track.kind === 'video') {
      this.remoteStream.addTrack(ev.track);
      this.remoteVideoEl.srcObject = this.remoteStream;
      this.remoteVideoEl.volume = 0;
    } else if (ev.track.kind === 'audio') {
      const ctx = new AudioContext();
      const audio = new Audio();
      audio.srcObject = ev.streams[0];
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.5;
      audio.onloadedmetadata = function() {
        const src = ctx.createMediaStreamSource(audio.srcObject as MediaStream);
        audio.play();
        audio.muted = true;
        src.connect(gainNode);
        gainNode.connect(ctx.destination);
      };
    }
  };

  private handleNegotiateEndeed = async () => {
    try {
      await this.pc.setLocalDescription(await this.pc.createOffer());
      this.postMessage({ data: this.pc.localDescription, target: this.target, type: EReceivedDataKey.OFFER });
    } catch (err) {
      console.error(err);
    }
  };

  public startCall = async (target: string) => {
    try {
      this.audio = new Audio('assets/outCall.mp3');
      this.audio.load();
      await this.audio.play();
      this.target = target;
      this.pc = new RTCPeerConnection(configuration);
      this.startListeningRTC('offer');
      this.localStream = await navigator.mediaDevices.getUserMedia(userMediaConstraints);
      const tracks = this.localStream.getTracks();
      tracks.forEach(track => this.pc.addTrack(track, this.localStream));
      this.localVideoEl.srcObject = this.localStream;
      this.localVideoEl.volume = 0;
      await this.localVideoEl.play();
      this.dispatch({ type: ChatActionTypes.SET_CALL_PROGRESS, payload: true });
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
