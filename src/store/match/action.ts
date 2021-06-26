import {DisplayElement} from 'src/type';

export enum MatchActionTypesEnum {
  UPDATE_IS_GAME_OVER_ACTION = 'UPDATE_IS_GAME_OVER_ACTION',
  UPDATE_GAME_OVER_ELEMENT_ACTION = 'UPDATE_GAME_OVER_ELEMENT_ACTION',
  CLEAR_GAME_OVER_ELEMENT_ACTION = 'CLEAR_GAME_OVER_ELEMENT_ACTION'
}

export interface UpdateIsGameOverAction {
  type: MatchActionTypesEnum.UPDATE_IS_GAME_OVER_ACTION;
  isGameOver: boolean;
}

export interface UpdateGameOverElementAction {
  type: MatchActionTypesEnum.UPDATE_GAME_OVER_ELEMENT_ACTION;
  gameOverElement: DisplayElement;
}

export interface ClearGameOverElementAction {
  type: MatchActionTypesEnum.CLEAR_GAME_OVER_ELEMENT_ACTION;
}

export type MatchAction = UpdateIsGameOverAction | UpdateGameOverElementAction | ClearGameOverElementAction;

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

export function clearGameOverElementAction(): ClearGameOverElementAction {
  return {
    type: MatchActionTypesEnum.CLEAR_GAME_OVER_ELEMENT_ACTION
  };
}
