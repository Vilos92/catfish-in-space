import {StarField} from './reducer';

export enum BackgroundStageActionTypesEnum {
  UPDATE_STAR_FIELD_A_ACTION = 'UPDATE_STAR_FIELD_A_ACTION',
  UPDATE_STAR_FIELD_B_ACTION = 'UPDATE_STAR_FIELD_B_ACTION'
}

export interface UpdateStarFieldAAction {
  type: BackgroundStageActionTypesEnum.UPDATE_STAR_FIELD_A_ACTION;
  starField: StarField;
}

export interface UpdateStarFieldBAction {
  type: BackgroundStageActionTypesEnum.UPDATE_STAR_FIELD_B_ACTION;
  starField: StarField;
}

export type BackgroundStageAction = UpdateStarFieldAAction | UpdateStarFieldBAction;

export function updateStarFieldAAction(starField: StarField): UpdateStarFieldAAction {
  return {
    type: BackgroundStageActionTypesEnum.UPDATE_STAR_FIELD_A_ACTION,
    starField
  };
}

export function updateStarFieldBAction(starField: StarField): UpdateStarFieldBAction {
  return {
    type: BackgroundStageActionTypesEnum.UPDATE_STAR_FIELD_B_ACTION,
    starField
  };
}
