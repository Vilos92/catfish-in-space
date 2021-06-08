import {Reducer} from 'redux';

import {GameElement} from '../../type';
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
      const updatedGameElementByMatterId = gameElement.matterBody
        ? {...state.gameElementByMatterId, [gameElement.matterBody.id]: gameElement}
        : state.gameElementByMatterId;

      return {...state, gameElements: updatedGameElements, gameElementByMatterId: updatedGameElementByMatterId};
    }
    case GameElementActionTypesEnum.UPDATE_GAME_ELEMENTS_ACTION: {
      const {gameElements} = action;

      // We need to track Game Elements by Matter id, to handle collision detection.
      // TODO: Add collision detection map when updating here.

      return {...state, gameElements};
    }
    default:
      return state;
  }
};
