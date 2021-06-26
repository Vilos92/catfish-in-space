import {PhysicsElement} from '../../type';
import {PidState} from '../../utility/pid';

export enum PlayerActionTypesEnum {
  UPDATE_PLAYER_GAME_ELEMENT_ACTION = 'UPDATE_PLAYER_GAME_ELEMENT_ACTION',
  CLEAR_PLAYER_GAME_ELEMENT_ACTION = 'CLEAR_PLAYER_GAME_ELEMENT_ACTION',
  UPDATE_PLAYER_PID_STATE_ACTION = 'UPDATE_PLAYER_PID_STATE_ACTION',
  UPDATE_PLAYER_IS_VIEWPORT_LOCKED_ACTION = 'UPDATE_PLAYER_IS_VIEWPORT_LOCKED_ACTION',
  UPDATE_PLAYER_PRIMARY_FIRE_TIMESTAMP_ACTION = 'UPDATE_PLAYER_PRIMARY_FIRE_TIMESTAMP_ACTION'
}

export interface UpdatePlayerGameElementAction {
  type: PlayerActionTypesEnum.UPDATE_PLAYER_GAME_ELEMENT_ACTION;
  physicsElement: PhysicsElement;
}

export interface ClearPlayerGameElementAction {
  type: PlayerActionTypesEnum.CLEAR_PLAYER_GAME_ELEMENT_ACTION;
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
  | ClearPlayerGameElementAction
  | UpdatePlayerPidStateAction
  | UpdatePlayerIsViewportLockedAction
  | UpdatePlayerPrimaryFireTimestamp;

export function updatePlayerGameElementAction(physicsElement: PhysicsElement): UpdatePlayerGameElementAction {
  return {
    type: PlayerActionTypesEnum.UPDATE_PLAYER_GAME_ELEMENT_ACTION,
    physicsElement
  };
}

export function clearPlayerGameElementAction(): ClearPlayerGameElementAction {
  return {
    type: PlayerActionTypesEnum.CLEAR_PLAYER_GAME_ELEMENT_ACTION
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
