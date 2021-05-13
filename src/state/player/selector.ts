import {State} from '../store';
import {PlayerState} from './reducer';

export const getPlayer = (state: State): PlayerState => state.player;
