import {combineReducers, createStore} from 'redux';

import {backgroundStageReducer} from './backgroundStage/reducer';
import {collisionReducer} from './collision/reducer';
import {gameElementReducer} from './gameElement/reducer';
import {keyboardReducer} from './keyboard/reducer';
import {mouseReducer} from './mouse/reducer';
import {playerReducer} from './player/reducer';
import {viewportReducer} from './viewport/reducer';

const rootReducer = combineReducers({
  backgroundStage: backgroundStageReducer,
  collision: collisionReducer,
  gameElement: gameElementReducer,
  keyboard: keyboardReducer,
  mouse: mouseReducer,
  player: playerReducer,
  viewport: viewportReducer
});

export const store = createStore(rootReducer);

export type GetState = typeof store.getState;
export type State = ReturnType<GetState>;

export type Dispatch = typeof store.dispatch;
