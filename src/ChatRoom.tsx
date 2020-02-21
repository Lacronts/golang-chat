import React from 'react';
import { getWebSocketHandler } from './ws';
import { Redirect } from 'react-router-dom';

interface IIncomingMessages {
  userName: string;
  body: string;
  timestamp: string;
}
interface IState {
  receivedMessage: IIncomingMessages[];
  message: string;
}

class ChatRoom extends React.Component<any, IState> {
  state: IState = {
    receivedMessage: [],
    message: '',
  };

  componentDidMount() {
    getWebSocketHandler().conn?.addEventListener('message', this.handleReceiveMessage);
  }

  componentWillMount() {
    getWebSocketHandler().conn?.removeEventListener('message', this.handleReceiveMessage);
  }

  handleReceiveMessage = (ev: MessageEvent) => {
    const newMessages = this.state.receivedMessage.concat(JSON.parse(ev.data));
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
        {this.state.receivedMessage.map(msg => (
          <div key={msg.timestamp}>
            <p>From: {msg.userName}</p>
            <div>Message: {msg.body}</div>
            <p>Time: {msg.timestamp}</p>
          </div>
        ))}
      </div>
    );
  }
}

export { ChatRoom };
