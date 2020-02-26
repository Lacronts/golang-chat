import { ChatActionTypes } from 'Redux/Actions/ChatActionTypes';
import { IChatState, IReduxAction } from 'Models';

const initial = {
  get state(): IChatState {
    return {
      userName: null,
      signInErrors: null,
      messages: [],
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
    case ChatActionTypes.RECEIVE_MESSAGE: {
      return {
        ...prevState,
        messages: action.payload,
      };
    }
    default:
      return prevState;
  }
};

export { chatReducer };
