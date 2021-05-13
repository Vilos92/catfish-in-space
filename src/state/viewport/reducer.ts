import {Coordinate, Dimension} from '../../type';
import {ActionTypesEnum, ViewportAction} from './action';
import {getViewportDimension} from './selector';

export interface ViewportState {
  coordinate: Coordinate;
  dimension: Dimension;
}

export const initialState: ViewportState = {
  coordinate: {x: 0, y: 0},
  dimension: getViewportDimension()
};

export function viewportReducer(state: ViewportState = initialState, action: ViewportAction): ViewportState {
  switch (action.type) {
    case ActionTypesEnum.UPDATE_VIEWPORT_COORDINATE_ACTION:
      return {...state, coordinate: action.coordinate};
    default:
      return state;
  }
}
