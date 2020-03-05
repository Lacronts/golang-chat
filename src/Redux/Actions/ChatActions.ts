import { Dispatch } from 'redux';
import { ChatActionTypes } from 'Redux/Actions/ChatActionTypes';
import { ConnectionActionTypes } from 'Redux/Actions/ConnectionActionTypes';
import { checkUserID } from 'Redux/Services/ChatService';
import { WSHandler } from 'WSHandlers/WSHandler';

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
    this.dispatch({ type: ChatActionTypes.SELECT_TARGET_USER, payload: targetUser });
  };

  postMessage = (target: string, message: string, isGroup: boolean) => {
    this.WSHandler.postMessage(JSON.stringify({ target, message, isGroup }));
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
