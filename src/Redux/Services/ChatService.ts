import axios from 'axios';
import { API_ADDRESS_HTTP } from './consts';

export function checkUserID(name: string) {
  return axios.get(`${API_ADDRESS_HTTP}/auth/${name}`);
}
