import {combineReducers, createStore} from 'redux';

import {playerReducer} from './player/reducer';
import {viewportReducer} from './viewport/reducer';

const rootReducer = combineReducers({
  player: playerReducer,
  viewport: viewportReducer
});

export const store = createStore(rootReducer);

export type GetState = typeof store.getState;
export type State = ReturnType<GetState>;
