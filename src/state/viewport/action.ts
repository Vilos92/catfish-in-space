import {Coordinate} from '../../type';

export enum ActionTypesEnum {
  UPDATE_COORDINATE_ACTION = 'update_coordinate_action'
}

interface UpdateCoordinateAction {
  type: ActionTypesEnum;
  coordinate: Coordinate;
}

export type ViewportAction = UpdateCoordinateAction;

export function updateCoordinateAction(coordinate: Coordinate): UpdateCoordinateAction {
  return {
    type: ActionTypesEnum.UPDATE_COORDINATE_ACTION,
    coordinate
  };
}
