import { Dispatch } from 'redux';
import { ChatActionTypes } from 'Redux/Actions/ChatActionTypes';
import { ConnectionActionTypes } from 'Redux/Actions/ConnectionActionTypes';
import { checkUserID } from 'Redux/Services/ChatService';
import { WSHandler } from 'WSHandlers/WSHandler';
import { IAppState } from 'Models';

class ChatActions {
  private WSHandler: WSHandler;

  constructor(private dispatch: Dispatch) {
    this.WSHandler = WSHandler.getInstance(dispatch);
  }

  connectToRoom = async (name: string) => {
    try {
      const response = await checkUserID(name);
      await this.WSHandler.init(response.data.userName);
      this.dispatch({ type: ChatActionTypes.SET_CURRENT_USERNAME, payload: response.data.userName });
    } catch (err) {
      this.dispatch({ type: ChatActionTypes.SET_SIGN_IN_ERRORS, payload: err });
    }
  };

  selectTargetUser = (targetUser: string) => {
    this.dispatch<any>((_, getState: () => IAppState) => {
      const { activeUsers } = getState().chat;
      const newUsers = activeUsers.map(user =>
        user.name === targetUser ? { ...user, messages: user.messages.map(message => ({ ...message, isUnread: false })) } : user,
      );
      this.closeMenu();
      this.dispatch({ type: ChatActionTypes.SELECT_TARGET_USER, payload: { targetUser, activeUsers: newUsers } });
    });
  };

  closeMenu = () => this.dispatch({ type: ChatActionTypes.CLOSE_MENU });

  openMenu = () => this.dispatch({ type: ChatActionTypes.OPEN_MENU });

  postMessage = (target: string, message: string, isGroup: boolean) => {
    const msg = { type: 'message', data: message, target, isGroup };
    this.WSHandler.postMessage(msg);
  };

  setVideoRefs = (localVideoEl: HTMLVideoElement, remoteVideoEl: HTMLVideoElement) => {
    this.WSHandler.setVideoRefs(localVideoEl, remoteVideoEl);
  };

  call = (target: string) => {
    this.WSHandler.startCall(target);
  };

  dropCall = () => {
    this.WSHandler.handleDropCall();
  };

  answerToCall = () => {
    this.WSHandler.handeAnswerToCall();
  };

  resetChatStore = () => {
    this.dispatch({ type: ChatActionTypes.RESET_CHAT });
  };

  closeConnection = () => {
    this.resetChatStore();
    this.dispatch({ type: ConnectionActionTypes.CLOSE_CONNECTION });
    this.WSHandler.closeConnection();
  };
}

export { ChatActions };
