import {combineReducers, createStore} from 'redux';

import {viewportReducer} from './viewport/reducer';

const rootReducer = combineReducers({
  viewport: viewportReducer
});

export const store = createStore(rootReducer);

export type GetState = typeof store.getState;
export type State = ReturnType<GetState>;
