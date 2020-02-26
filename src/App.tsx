import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { RouteListener } from 'Router/RouteListener';

const App: React.FunctionComponent = () => {
  return (
    <>
      <CssBaseline />
      <RouteListener />
    </>
  );
};

export default App;
