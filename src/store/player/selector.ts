import {State} from '../gameReducer';
import {PlayerState} from './reducer';

export const getPlayer = (state: State): PlayerState => state.player;
