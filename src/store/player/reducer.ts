import produce from 'immer';
import {Reducer} from 'redux';

import {GameElement} from '../../type';
import {ActionTypesEnum, PlayerAction} from './action';

export interface PlayerState {
  gameElement: GameElement;
}

export const initialState: PlayerState = {
  gameElement: {
    coordinate: {x: 0, y: 0}
  }
};

export const playerReducer: Reducer<PlayerState, PlayerAction> = produce((state: PlayerState, action: PlayerAction) => {
  switch (action.type) {
    case ActionTypesEnum.UPDATE_PLAYER_COORDINATE_ACTION: {
      const {gameElement} = state;

      gameElement.coordinate = action.coordinate;
      break;
    }
    case ActionTypesEnum.UPDATE_PLAYER_SPRITE_ACTION: {
      const {gameElement} = state;

      gameElement.sprite = action.sprite;
      break;
    }
    default:
  }
}, initialState);
