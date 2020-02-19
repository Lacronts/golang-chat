import React, { useEffect } from 'react';
import { getWebSocketHandler } from './ws';

function App() {
  useEffect(() => {
    getWebSocketHandler();
  });
  return <div className='App'></div>;
}

export default App;
