import {State} from '../store';
import {KeyboardState} from './reducer';

export const getKeyboard = (state: State): KeyboardState => state.keyboard;
