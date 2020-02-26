import axios from 'axios';
import { Dispatch } from 'redux';
import { ChatActionTypes } from 'Redux/Actions/ChatActionTypes';
import { ConnectionActionTypes } from 'Redux/Actions/ConnectionActionTypes';
import { WebSocketHandler } from '../../ws';

class ChatActions {
  private webSocketHandler: WebSocketHandler;
  constructor(private dispatch: Dispatch) {
    this.webSocketHandler = WebSocketHandler.getInstance(dispatch);
  }

  connectToServer = async (name: string) => {
    try {
      const response = await axios.get(`http://localhost:8080/auth/${name}`);
      await this.webSocketHandler.init(response.data.userName);
      this.dispatch({ type: ChatActionTypes.SET_CURRENT_USERNAME, payload: name });
    } catch (err) {
      this.dispatch({ type: ChatActionTypes.SET_SIGN_IN_ERRORS, payload: err });
    }
  };

  postMessage = (message: string) => {
    this.webSocketHandler.postMessage(message);
  };

  closeConnection = () => {
    this.dispatch({ type: ConnectionActionTypes.CLOSE_CONNECTION });
    this.webSocketHandler.closeConnection();
  };
}

export { ChatActions };
