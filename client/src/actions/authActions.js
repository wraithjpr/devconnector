import axios from 'axios';

// Types
import { GET_ERRORS } from './types';
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
      history.push('/login');
    })
    .catch(err => {
      console.error(
        `${err.response.status} ${err.response.statusText}`,
        err.response.data
      );
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      });
    });
};
