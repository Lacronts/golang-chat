import axios from 'axios';

const API_ADDRESS = 'http://localhost:8080';

export function checkUserID(name: string) {
  return axios.get(`${API_ADDRESS}/auth/${name}`);
}

export function getUsers() {
  return axios.get(`${API_ADDRESS}/users`);
}
