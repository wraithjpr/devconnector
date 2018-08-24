import axios from 'axios';

const AUTH_HEADER = 'Authorization';

const setAuthToken = token => {
  if (token) {
    // Apply the token to every request
    axios.defaults.headers.common[AUTH_HEADER] = token;
  } else {
    // Delete the auth header
    delete axios.defaults.headers.common[AUTH_HEADER];
  }
};

export default setAuthToken;
