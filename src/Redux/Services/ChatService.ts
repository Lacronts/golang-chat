import axios from 'axios';
import { API_ADDRESS_HTTP } from './consts';

export function checkUserID(name: string) {
  const hostName = window.location.hostname;
  if (hostName.indexOf('heroku') !== -1) {
    return axios.get(`https://${hostName}/auth/${name}`);
  } else {
    return axios.get(`http://${API_ADDRESS_HTTP}/auth/${name}`);
  }
}
