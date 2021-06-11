import {Reducer} from 'redux';

import {GameElement, isPhysicsElement, PhysicsElement} from '../../type';
import {GameElementAction, GameElementActionTypesEnum} from './action';

export interface GameElementState {
  gameElements: ReadonlyArray<GameElement>;
  physicsElementByMatterId: Map<number, PhysicsElement>;
}

const initialState: GameElementState = {
  gameElements: [],
  physicsElementByMatterId: new Map<number, PhysicsElement>()
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
      const updatedPhysicsElementByMatterId = isPhysicsElement(gameElement)
        ? {...state.physicsElementByMatterId, [gameElement.matterBody.id]: gameElement}
        : state.physicsElementByMatterId;

      return {...state, gameElements: updatedGameElements, physicsElementByMatterId: updatedPhysicsElementByMatterId};
    }
    case GameElementActionTypesEnum.UPDATE_GAME_ELEMENTS_ACTION: {
      const {gameElements} = action;

      const matterIdGameElementPairs: ReadonlyArray<[number, PhysicsElement]> = gameElements
        .filter(isPhysicsElement)
        .map((physicsElement: PhysicsElement) => [physicsElement.matterBody.id, physicsElement]);

      const updatedPhysicsElementByMatterId = new Map(matterIdGameElementPairs);

      return {...state, gameElements, physicsElementByMatterId: updatedPhysicsElementByMatterId};
    }
    default:
      return state;
  }
};
