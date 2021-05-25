import {combineReducers, createStore} from 'redux';

import {gameElementReducer} from './gameElement/reducer';
import {keyboardReducer} from './keyboard/reducer';
import {playerReducer} from './player/reducer';
import {viewportReducer} from './viewport/reducer';

const rootReducer = combineReducers({
  gameElement: gameElementReducer,
  keyboard: keyboardReducer,
  player: playerReducer,
  viewport: viewportReducer
});

export const store = createStore(rootReducer);

export type GetState = typeof store.getState;
export type State = ReturnType<GetState>;

export type Dispatch = typeof store.dispatch;