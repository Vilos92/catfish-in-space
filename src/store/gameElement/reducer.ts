import {Reducer} from 'redux';

import {GameElement, isPhysicsElement, PhysicsElement} from '../../type';
import {GameElementAction, GameElementActionTypesEnum} from './action';

export interface GameElementState {
  gameElements: ReadonlyArray<GameElement>;
  gameElementByMatterId: Map<number, GameElement>;
}

const initialState: GameElementState = {
  gameElements: [],
  gameElementByMatterId: new Map<number, GameElement>()
};

export const gameElementReducer: Reducer<GameElementState, GameElementAction> = (
  state: GameElementState = initialState,
  action: GameElementAction
) => {
  switch (action.type) {
    case GameElementActionTypesEnum.PUSH_GAME_ELEMENT_ACTION: {
      const {gameElements} = state;
      const {gameElement} = action;

      const updatedGameElements: ReadonlyArray<GameElement> = [...gameElements, gameElement];

      // We need to track Game Elements by Matter id, to handle collision detection.
      const updatedGameElementByMatterId = isPhysicsElement(gameElement)
        ? {...state.gameElementByMatterId, [gameElement.matterBody.id]: gameElement}
        : state.gameElementByMatterId;

      return {...state, gameElements: updatedGameElements, gameElementByMatterId: updatedGameElementByMatterId};
    }
    case GameElementActionTypesEnum.UPDATE_GAME_ELEMENTS_ACTION: {
      const {gameElements} = action;

      const matterIdGameElementPairs: ReadonlyArray<[number, PhysicsElement]> = gameElements
        .filter(isPhysicsElement)
        .map((physicsElement: PhysicsElement) => [physicsElement.matterBody.id, physicsElement]);

      const updatedGameElementByMatterId = new Map(matterIdGameElementPairs);

      return {...state, gameElements, gameElementByMatterId: updatedGameElementByMatterId};
    }
    default:
      return state;
  }
};
