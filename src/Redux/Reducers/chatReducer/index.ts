import { ChatActionTypes } from 'Redux/Actions/ChatActionTypes';
import { IChatState, IReduxAction } from 'Models';
import { ETarget } from 'Enums';

const initial = {
  get state(): IChatState {
    return {
      userName: null,
      signInErrors: null,
      activeUsers: [{ name: ETarget.BROADCAST, messages: [], color: '200,200,200', isGroup: true }],
      targetUser: null,
    };
  },
};

const chatReducer = (prevState = initial.state, action: IReduxAction<any>): IChatState => {
  switch (action.type) {
    case ChatActionTypes.SET_CURRENT_USERNAME: {
      return {
        ...prevState,
        userName: action.payload,
      };
    }
    case ChatActionTypes.SET_SIGN_IN_ERRORS: {
      return {
        ...prevState,
        signInErrors: action.payload,
      };
    }
    case ChatActionTypes.UPDATE_ACTIVE_USERS: {
      return {
        ...prevState,
        activeUsers: action.payload,
      };
    }
    case ChatActionTypes.SELECT_TARGET_USER: {
      return {
        ...prevState,
        targetUser: action.payload,
      };
    }
    case ChatActionTypes.RESET_CHAT: {
      return initial.state;
    }
    default:
      return prevState;
  }
};

export { chatReducer };
