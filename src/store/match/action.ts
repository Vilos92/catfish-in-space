import {DisplayElement} from 'src/type';

export enum MatchActionTypesEnum {
  UPDATE_IS_GAME_OVER_ACTION = 'UPDATE_IS_GAME_OVER_ACTION',
  UPDATE_GAME_OVER_ELEMENT_ACTION = 'UPDATE_GAME_OVER_ELEMENT_ACTION'
}

export interface UpdateIsGameOverAction {
  type: MatchActionTypesEnum.UPDATE_IS_GAME_OVER_ACTION;
  isGameOver: boolean;
}

export interface UpdateGameOverElementAction {
  type: MatchActionTypesEnum.UPDATE_GAME_OVER_ELEMENT_ACTION;
  gameOverElement: DisplayElement;
}

export type MatchAction = UpdateIsGameOverAction | UpdateGameOverElementAction;

export function updateIsGameOverAction(isGameOver: boolean): UpdateIsGameOverAction {
  return {
    type: MatchActionTypesEnum.UPDATE_IS_GAME_OVER_ACTION,
    isGameOver
  };
}

export function updateGameOverElementAction(gameOverElement: DisplayElement): UpdateGameOverElementAction {
  return {
    type: MatchActionTypesEnum.UPDATE_GAME_OVER_ELEMENT_ACTION,
    gameOverElement
  };
}
