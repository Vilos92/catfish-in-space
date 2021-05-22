import {Coordinate} from '../../type';

export enum ViewportActionTypesEnum {
  UPDATE_VIEWPORT_COORDINATE_ACTION = 'UPDATE_VIEWPORT_COORDINATE_ACTION'
}

export interface UpdateViewportCoordinateAction {
  type: ViewportActionTypesEnum;
  coordinate: Coordinate;
}

export type ViewportAction = UpdateViewportCoordinateAction;

export function updateViewportCoordinateAction(coordinate: Coordinate): UpdateViewportCoordinateAction {
  return {
    type: ViewportActionTypesEnum.UPDATE_VIEWPORT_COORDINATE_ACTION,
    coordinate
  };
}
