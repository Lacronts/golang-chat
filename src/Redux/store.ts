import { applyMiddleware, createStore } from 'redux';
import ReduxThunk from 'redux-thunk';
import { rootReducer } from 'Redux/Reducers/rootReducer';
import { composeWithDevTools } from 'redux-devtools-extension';

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(ReduxThunk)));

export { store };
