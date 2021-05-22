import {State} from '../gameReducer';
import {KeyboardState} from './reducer';

export const getKeyboard = (state: State): KeyboardState => state.keyboard;
