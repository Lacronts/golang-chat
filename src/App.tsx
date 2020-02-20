import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Login } from './Login';
import { ChatRoom } from './ChatRoom';

const App = () => {
  return (
    <Switch>
      <Route path='/' exact component={Login} />
      <Route path='/room' component={ChatRoom} />
    </Switch>
  );
};

export default App;
