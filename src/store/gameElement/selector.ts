import {GameElement} from '../../type';
import {State} from '../gameReducer';
import {GameElementState} from './reducer';

const getGameElement = (state: State): GameElementState => state.gameElement;
export const getGameElements = (state: State): ReadonlyArray<GameElement> => getGameElement(state).gameElements;
