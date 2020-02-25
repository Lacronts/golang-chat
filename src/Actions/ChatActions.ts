import axios from 'axios';

class ChatActions {
  checkUserID = (name: string) => {
    return axios.get(`http://localhost:8080/auth/${name}`);
  };
}

export { ChatActions };
