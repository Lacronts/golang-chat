import { ConnectionActionTypes } from 'Redux/Actions/ConnectionActionTypes';
import { EConnStatus } from 'Enums';
import { IReduxAction, IConnectionState } from 'Models';

const initial = {
  get state(): IConnectionState {
    return {
      status: EConnStatus.CLOSED,
    };
  },
};

const connectionReducer = (prevState = initial.state, action: IReduxAction<EConnStatus>) => {
  switch (action.type) {
    case ConnectionActionTypes.CLOSE_CONNECTION: {
      return {
        status: EConnStatus.CLOSED,
      };
    }
    case ConnectionActionTypes.OPEN_CONNECTION: {
      return {
        status: EConnStatus.OPENED,
      };
    }
    default:
      return prevState;
  }
};

export { connectionReducer };
