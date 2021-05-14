import produce from 'immer';
import {Reducer} from 'redux';

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

export const viewportReducer: Reducer<ViewportState, ViewportAction> = produce(
  (state: ViewportState, action: ViewportAction) => {
    switch (action.type) {
      case ActionTypesEnum.UPDATE_VIEWPORT_COORDINATE_ACTION:
        state.coordinate = action.coordinate;
      default:
    }
  },
  initialState
);
