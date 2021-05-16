import {Coordinate} from '../../type';

export enum ActionTypesEnum {
  UPDATE_VIEWPORT_COORDINATE_ACTION = 'UPDATE_VIEWPORT_COORDINATE_ACTION'
}

export interface UpdateViewportCoordinateAction {
  type: ActionTypesEnum;
  coordinate: Coordinate;
}

export type ViewportAction = UpdateViewportCoordinateAction;

export function updateViewportCoordinateAction(coordinate: Coordinate): UpdateViewportCoordinateAction {
  return {
    type: ActionTypesEnum.UPDATE_VIEWPORT_COORDINATE_ACTION,
    coordinate
  };
}
