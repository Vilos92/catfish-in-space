import {Reducer} from 'redux';

import {GameElement} from '../../type';
import {GameElementAction, GameElementActionTypesEnum} from './action';

export interface GameElementState {
  gameElements: ReadonlyArray<GameElement>;
}

const initialState: GameElementState = {
  gameElements: []
};

export const gameElementReducer: Reducer<GameElementState, GameElementAction> = (
  state: GameElementState = initialState,
  action: GameElementAction
) => {
  switch (action.type) {
    case GameElementActionTypesEnum.PUSH_GAME_ELEMENT_ACTION: {
      const {gameElements} = state;

      const updatedGameElements: ReadonlyArray<GameElement> = [...gameElements, action.gameElement];

      return {...state, gameElements: updatedGameElements};
    }
    case GameElementActionTypesEnum.UPDATE_GAME_ELEMENTS_ACTION: {
      return {...state, gameElements: action.gameElements};
    }
    default:
      return state;
  }
};
