import {Reducer} from 'redux';

import {GameElement} from '../../type';
import {BackgroundStageAction, BackgroundStageActionTypesEnum} from './action';

/**
 * An x-y map of stars.
 */
export type StarField = Map<number, Map<number, GameElement>>;

export interface BackgroundStageState {
  starField: StarField;
}

export const initialState: BackgroundStageState = {
  starField: new Map<number, Map<number, GameElement>>()
};

export const backgroundStageReducer: Reducer<BackgroundStageState, BackgroundStageAction> = (
  state: BackgroundStageState = initialState,
  action: BackgroundStageAction
) => {
  switch (action.type) {
    case BackgroundStageActionTypesEnum.UPDATE_STAR_FIELD_ACTION: {
      return {...state, starField: action.starField};
    }
    default:
      return state;
  }
};