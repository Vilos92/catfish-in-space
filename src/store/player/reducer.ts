import {Reducer} from 'redux';

import {GameElement} from '../../type';
import {PidState} from '../../util/pid';
import {PlayerAction, PlayerActionTypesEnum} from './action';

export interface PlayerState {
  gameElement: GameElement;
  pidState: PidState;
}

export const initialState: PlayerState = {
  gameElement: {
    coordinate: {x: 0, y: 0},
    rotation: 0
  },
  pidState: {integral: 0, error: 0, output: 0}
};

export const playerReducer: Reducer<PlayerState, PlayerAction> = (
  state: PlayerState = initialState,
  action: PlayerAction
) => {
  switch (action.type) {
    case PlayerActionTypesEnum.UPDATE_PLAYER_GAME_ELEMENT_ACTION: {
      const {gameElement} = state;

      const updatedGameElement: GameElement = {...gameElement, ...action.gameElement};

      return {...state, gameElement: updatedGameElement};
    }
    case PlayerActionTypesEnum.UPDATE_PLAYER_PID_STATE_ACTION: {
      return {...state, pidState: action.pidState};
    }
    default:
      return state;
  }
};
