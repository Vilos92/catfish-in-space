import {ViewportState} from './reducer';
import {Coordinate} from '../../index';

export enum ActionTypesEnum {
  UPDATE_COORDINATE_ACTION = 'update_coordinate_action'
}

interface UpdateCoordinateAction {
  type: ActionTypesEnum;
  coordinate: Coordinate;
}

export type ViewportAction = UpdateCoordinateAction;

export function updateCoordinateAction(state: ViewportState, coordinate: Coordinate): UpdateCoordinateAction {
  return {
    type: ActionTypesEnum.UPDATE_COORDINATE_ACTION,
    coordinate
  };
}
