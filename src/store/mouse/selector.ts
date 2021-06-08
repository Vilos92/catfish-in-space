import {State} from '../gameReducer';
import {MouseState} from './reducer';

export const getMouse = (state: State): MouseState => state.mouse;
