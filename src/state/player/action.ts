import {Coordinate} from '../../type';

export enum ActionTypesEnum {
  UPDATE_PLAYER_COORDINATE_ACTION = 'update_player_coordinate_action'
}

export interface UpdatePlayerCoordinateAction {
  type: ActionTypesEnum;
  coordinate: Coordinate;
}

export type PlayerAction = UpdatePlayerCoordinateAction;

export function updatePlayerCoordinateAction(coordinate: Coordinate): UpdatePlayerCoordinateAction {
  return {
    type: ActionTypesEnum.UPDATE_PLAYER_COORDINATE_ACTION,
    coordinate
  };
}
