import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const initialState = {};
const middleware = [thunk];

/* eslint-disable no-underscore-dangle */
const store = createStore(
  rootReducer,
  initialState,
  compose(
    applyMiddleware(...middleware),
    typeof window === 'object' &&
      window.__REDUX_DEVTOOLS_EXTENSION__ &&
      window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);
/* eslint-enable */

export default store;
