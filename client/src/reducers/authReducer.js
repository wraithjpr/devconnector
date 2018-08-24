import { TEST_DISPATCH } from '../actions/types';

const initialState = {
  isAuthenticated: false,
  user: {}
};

export default function(state = initialState, action) {
  switch (action.type) {
    case TEST_DISPATCH:
      return {
        ...state,
        user: {
          ...action.payload,
          password: undefined,
          passwordHash: action.payload.password
        }
      };
    default:
      return state;
  }
}
