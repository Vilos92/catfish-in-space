import {Reducer} from 'redux';

import {GameElement} from '../../type';
import {BackgroundStageAction, BackgroundStageActionTypesEnum} from './action';

/**
 * A row-col (y-x) map of stars.
 */
export type StarField = Map<number, Map<number, GameElement>>;

export interface BackgroundStageState {
  starFieldA: StarField;
  starFieldB: StarField;
}

export const initialState: BackgroundStageState = {
  starFieldA: new Map<number, Map<number, GameElement>>(),
  starFieldB: new Map<number, Map<number, GameElement>>()
};

export const backgroundStageReducer: Reducer<BackgroundStageState, BackgroundStageAction> = (
  state: BackgroundStageState = initialState,
  action: BackgroundStageAction
) => {
  switch (action.type) {
    case BackgroundStageActionTypesEnum.UPDATE_STAR_FIELD_A_ACTION: {
      return {...state, starFieldA: action.starField};
    }
    case BackgroundStageActionTypesEnum.UPDATE_STAR_FIELD_B_ACTION: {
      return {...state, starFieldB: action.starField};
    }
    default:
      return state;
  }
};
