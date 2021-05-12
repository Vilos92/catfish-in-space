import {combineReducers, createStore} from 'redux';
import {viewportReducer} from './viewport/reducer';

const rootReducer = combineReducers({
  viewportReducer
});

export const store = createStore(rootReducer);
