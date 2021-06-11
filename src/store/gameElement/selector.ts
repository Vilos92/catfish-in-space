import {GameElement, PhysicsElement} from '../../type';
import {State} from '../gameReducer';
import {GameElementState} from './reducer';

const getGameElement = (state: State): GameElementState => state.gameElement;
export const getGameElements = (state: State): ReadonlyArray<GameElement> => getGameElement(state).gameElements;
export const getPhysicsElementByMatterId = (state: State): Map<number, PhysicsElement> =>
  getGameElement(state).physicsElementByMatterId;
