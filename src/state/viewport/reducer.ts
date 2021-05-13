import {Coordinate} from '../../type';
import {ActionTypesEnum, ViewportAction} from './action';

export interface ViewportState {
  coordinate: Coordinate;
}

export const initialState: ViewportState = {
  coordinate: {x: 0, y: 0}
};

export function viewportReducer(state: ViewportState = initialState, action: ViewportAction): ViewportState {
  switch (action.type) {
    case ActionTypesEnum.UPDATE_VIEWPORT_COORDINATE_ACTION:
      return {...state, coordinate: action.coordinate};
    default:
      return state;
  }
}
