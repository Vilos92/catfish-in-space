import {GameElement} from '../../type';
import {PidState} from '../../utility/pid';

export enum PlayerActionTypesEnum {
  UPDATE_PLAYER_GAME_ELEMENT_ACTION = 'UPDATE_PLAYER_GAME_ELEMENT_ACTION',
  UPDATE_PLAYER_PID_STATE_ACTION = 'UPDATE_PLAYER_PID_STATE_ACTION',
  UPDATE_PLAYER_IS_VIEWPORT_LOCKED_ACTION = 'UPDATE_PLAYER_IS_VIEWPORT_LOCKED_ACTION',
  UPDATE_PLAYER_PRIMARY_FIRE_TIMESTAMP_ACTION = 'UPDATE_PLAYER_PRIMARY_FIRE_TIMESTAMP_ACTION'
}

export interface UpdatePlayerGameElementAction {
  type: PlayerActionTypesEnum.UPDATE_PLAYER_GAME_ELEMENT_ACTION;
  gameElement: GameElement;
}

export interface UpdatePlayerPidStateAction {
  type: PlayerActionTypesEnum.UPDATE_PLAYER_PID_STATE_ACTION;
  pidState: PidState;
}

export interface UpdatePlayerIsViewportLockedAction {
  type: PlayerActionTypesEnum.UPDATE_PLAYER_IS_VIEWPORT_LOCKED_ACTION;
  isViewportLocked: boolean;
}

export interface UpdatePlayerPrimaryFireTimestamp {
  type: PlayerActionTypesEnum.UPDATE_PLAYER_PRIMARY_FIRE_TIMESTAMP_ACTION;
  primaryFireTimestamp: number;
}

export type PlayerAction =
  | UpdatePlayerGameElementAction
  | UpdatePlayerPidStateAction
  | UpdatePlayerIsViewportLockedAction
  | UpdatePlayerPrimaryFireTimestamp;

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

export function updatePlayerIsViewportLockedAction(isViewportLocked: boolean): UpdatePlayerIsViewportLockedAction {
  return {
    type: PlayerActionTypesEnum.UPDATE_PLAYER_IS_VIEWPORT_LOCKED_ACTION,
    isViewportLocked
  };
}

export function updatePlayerPrimaryFireTimestampAction(primaryFireTimestamp: number): UpdatePlayerPrimaryFireTimestamp {
  return {
    type: PlayerActionTypesEnum.UPDATE_PLAYER_PRIMARY_FIRE_TIMESTAMP_ACTION,
    primaryFireTimestamp
  };
}
