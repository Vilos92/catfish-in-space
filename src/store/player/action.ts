import {GameElement} from '../../type';
import {PidState} from '../../util/pid';

export enum PlayerActionTypesEnum {
  UPDATE_PLAYER_GAME_ELEMENT_ACTION = 'UPDATE_PLAYER_GAME_ELEMENT_ACTION',
  UPDATE_PLAYER_PID_STATE_ACTION = 'UPDATE_PLAYER_PID_STATE_ACTION'
}

export interface UpdatePlayerGameElementAction {
  type: PlayerActionTypesEnum.UPDATE_PLAYER_GAME_ELEMENT_ACTION;
  gameElement: GameElement;
}

export interface UpdatePlayerPidStateAction {
  type: PlayerActionTypesEnum.UPDATE_PLAYER_PID_STATE_ACTION;
  pidState: PidState;
}

export type PlayerAction = UpdatePlayerGameElementAction | UpdatePlayerPidStateAction;

export function updatePlayerGameElementAction(gameElement: GameElement): UpdatePlayerGameElementAction {
  return {
    type: PlayerActionTypesEnum.UPDATE_PLAYER_GAME_ELEMENT_ACTION,
    gameElement
  };
}

export function updatePlayerPidStateAction(pidState: PidState): UpdatePlayerPidStateAction {
  return {
    type: PlayerActionTypesEnum.UPDATE_PLAYER_PID_STATE_ACTION,
    pidState
  };
}
