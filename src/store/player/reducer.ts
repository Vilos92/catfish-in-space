import {Howl} from 'howler';
import {Reducer} from 'redux';

import {PhysicsElement} from '../../type';
import {PidState} from '../../utility/pid';
import {PlayerAction, PlayerActionTypesEnum} from './action';

export interface PlayerState {
  gameElement?: PhysicsElement;
  // We store the thruster sound as we must recompute its position.
  thrusterSound?: Howl;
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
      return {...state, gameElement: action.physicsElement};
    }
    case PlayerActionTypesEnum.CLEAR_PLAYER_GAME_ELEMENT_ACTION: {
      return {...state, gameElement: undefined};
    }
    case PlayerActionTypesEnum.UPDATE_PLAYER_THRUSTER_SOUND_ACTION: {
      return {...state, thrusterSound: action.thrusterSound};
    }
    case PlayerActionTypesEnum.CLEAR_PLAYER_THRUSTER_SOUND_ACTION: {
      return {...state, thrusterSound: undefined};
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
