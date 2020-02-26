import { combineReducers } from 'redux';
import { chatReducer } from 'Redux/Reducers/chatReducer';
import { connectionReducer } from 'Redux/Reducers/connectionReducer';

const rootReducer = combineReducers<any>({
  chat: chatReducer,
  connection: connectionReducer,
});

export { rootReducer };
