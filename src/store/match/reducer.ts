import produce from 'immer';
import {Reducer} from 'redux';
import {DisplayElement} from 'src/type';

import {MatchAction, MatchActionTypesEnum} from './action';

export interface MatchState {
  isGameOver: boolean;
  gameOverElement?: DisplayElement;
}

const initialState: MatchState = {
  isGameOver: false,
  gameOverElement: undefined
};

export const matchReducer: Reducer<MatchState, MatchAction> = produce((state: MatchState, action: MatchAction) => {
  switch (action.type) {
    case MatchActionTypesEnum.UPDATE_IS_GAME_OVER_ACTION: {
      const {isGameOver} = action;

      state.isGameOver = isGameOver;
      break;
    }
    case MatchActionTypesEnum.UPDATE_GAME_OVER_ELEMENT_ACTION: {
      const {gameOverElement} = action;

      state.gameOverElement = gameOverElement;
      break;
    }
    case MatchActionTypesEnum.CLEAR_GAME_OVER_ELEMENT_ACTION: {
      state.gameOverElement = undefined;
      break;
    }
    default:
  }
}, initialState);
