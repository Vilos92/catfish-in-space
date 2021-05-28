import {StarField} from './reducer';

export enum BackgroundStageActionTypesEnum {
  UPDATE_STAR_FIELD_ACTION = 'UPDATE_STAR_FIELD_ACTION'
}

export interface UpdateStarFieldAction {
  type: BackgroundStageActionTypesEnum.UPDATE_STAR_FIELD_ACTION;
  starField: StarField;
}

export type BackgroundStageAction = UpdateStarFieldAction;

export function updateStarFieldAction(starField: StarField): UpdateStarFieldAction {
  return {
    type: BackgroundStageActionTypesEnum.UPDATE_STAR_FIELD_ACTION,
    starField
  };
}
