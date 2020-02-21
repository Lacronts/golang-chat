import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { SignIn } from 'SignIn';
import { ChatRoom } from 'ChatRoom';
import CssBaseline from '@material-ui/core/CssBaseline';

const App = () => {
  return (
    <>
      <CssBaseline />
      <Switch>
        <Route path='/' exact component={SignIn} />
        <Route path='/room' component={ChatRoom} />
      </Switch>
    </>
  );
};

export default App;
