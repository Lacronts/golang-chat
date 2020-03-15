import axios from 'axios';
import { API_ADDRESS_HTTP } from './consts';

export function checkUserID(name: string) {
  const hostName = window.location.hostname;
  let path;
  if (hostName.indexOf('heroku') !== -1) {
    path = hostName;
  } else {
    path = API_ADDRESS_HTTP;
  }
  return axios.get(`http://${path}/auth/${name}`);
}
