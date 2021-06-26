import {State} from '../gameReducer';
import {MatchState} from './reducer';

export const getMatch = (state: State): MatchState => state.match;
