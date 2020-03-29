import React from 'react';
import ReactDOM from 'react-dom';
import adapter from 'webrtc-adapter';
import { Provider } from 'react-redux';
import App from 'App';
import { Router } from 'react-router-dom';
import { history } from 'Utils';
import { store } from 'Redux/store';

import 'simplebar/dist/simplebar.min.css';
import './index.css';

console.info('browser:', adapter.browserDetails.browser);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root'),
);
