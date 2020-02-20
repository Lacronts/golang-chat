import React from 'react';
import { getWebSocketHandler } from './ws';
import { Redirect } from 'react-router-dom';

interface IState {
  receivedMessage: string[];
  message: string;
}

class ChatRoom extends React.Component<any, IState> {
  state = {
    receivedMessage: [''],
    message: '',
  };

  handleReceiveMessage = (ev: MessageEvent) => {
    const newMessages = this.state.receivedMessage.concat(ev.data);
    this.setState({ receivedMessage: newMessages });
  };

  handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ message: e.target.value });
  };

  handleSendMessage = () => {
    getWebSocketHandler().postMessage(this.state.message);
    this.setState({ message: '' });
  };

  render() {
    if (getWebSocketHandler().isClosed()) {
      return <Redirect to='/' />;
    }
    return (
      <div>
        <textarea onChange={this.handleMessageChange} value={this.state.message}></textarea>
        <button onClick={this.handleSendMessage}>Send message</button>
        Messages:
        {this.state.receivedMessage.map((mes, idx) => (
          <div key={idx}>{mes}</div>
        ))}
      </div>
    );
  }
}

export { ChatRoom };
