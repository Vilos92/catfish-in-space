import {Reducer} from 'redux';

import {GameElement} from '../../type';
import {PidState} from '../../utility/pid';
import {PlayerAction, PlayerActionTypesEnum} from './action';

export interface PlayerState {
  gameElement?: GameElement;
  pidState: PidState;
  isViewportLocked: boolean;
  primaryFireTimestamp: number;
}

export const initialState: PlayerState = {
  pidState: {integral: 0, error: 0, output: 0},
  isViewportLocked: true,
  primaryFireTimestamp: 0
};

export const playerReducer: Reducer<PlayerState, PlayerAction> = (
  state: PlayerState = initialState,
  action: PlayerAction
) => {
  switch (action.type) {
    case PlayerActionTypesEnum.UPDATE_PLAYER_GAME_ELEMENT_ACTION: {
      return {...state, gameElement: action.gameElement};
    }
    case PlayerActionTypesEnum.UPDATE_PLAYER_PID_STATE_ACTION: {
      return {...state, pidState: action.pidState};
    }
    case PlayerActionTypesEnum.UPDATE_PLAYER_IS_VIEWPORT_LOCKED_ACTION: {
      return {...state, isViewportLocked: action.isViewportLocked};
    }
    case PlayerActionTypesEnum.UPDATE_PLAYER_PRIMARY_FIRE_TIMESTAMP_ACTION: {
      return {...state, primaryFireTimestamp: action.primaryFireTimestamp};
    }
    default:
      return state;
  }
};
