import axios from 'axios';
import jwt_decode from 'jwt-decode';
import setAuthToken from '../utils/setAuthToken';

// Types
import { GET_ERRORS } from './types';
import { SET_CURRENT_USER } from './types';
import { TEST_DISPATCH } from './types';

// Register User
export const registerUser = (userData, history) => dispatch => {
  axios
    .post('/api/users/register', userData)
    .then(res => {
      console.log(`${res.status} ${res.statusText}`, res.data);
      dispatch({
        type: TEST_DISPATCH,
        payload: res.data
      });
      return history.push('/login');
    })
    .catch(err => {
      console.error(
        `${err.response.status} ${err.response.statusText}`,
        err.response.data
      );
      return dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      });
    });
};

// Login User. Gets the user token and store in local storage.
export const loginUser = userData => dispatch => {
  axios
    .post('/api/users/login', userData)
    .then(res => {
      console.log(`${res.status} ${res.statusText}`, res.data);

      // Save to local storage
      const { token } = res.data;

      localStorage.setItem('jwtToken', token);

      // Assign the token to Auth header
      setAuthToken(token);

      // Decode the token to get the user data and dispatch.
      return dispatch(setCurrentUser(jwt_decode(token)));
    })
    .catch(err => {
      console.error(
        `${err.response.status} ${err.response.statusText}`,
        err.response.data
      );
      return dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      });
    });
};

// Set the current signed in user
export const setCurrentUser = decodedToken => ({
  type: SET_CURRENT_USER,
  payload: decodedToken
});
