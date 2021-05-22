import {GameElement} from '../../type';

export enum GameElementActionTypesEnum {
  PUSH_GAME_ELEMENT_ACTION = 'PUSH_GAME_ELEMENT_ACTION',
  UPDATE_GAME_ELEMENTS_ACTION = 'UPDATE_GAME_ELEMENTS_ACTION'
}

export interface PushGameElementAction {
  type: GameElementActionTypesEnum.PUSH_GAME_ELEMENT_ACTION;
  gameElement: GameElement;
}

export interface UpdateGameElementsAction {
  type: GameElementActionTypesEnum.UPDATE_GAME_ELEMENTS_ACTION;
  gameElements: ReadonlyArray<GameElement>;
}

export type GameElementAction = PushGameElementAction | UpdateGameElementsAction;

export function pushGameElementAction(gameElement: GameElement): PushGameElementAction {
  return {
    type: GameElementActionTypesEnum.PUSH_GAME_ELEMENT_ACTION,
    gameElement
  };
}

export function updateGameElementsAction(gameElements: ReadonlyArray<GameElement>): UpdateGameElementsAction {
  return {
    type: GameElementActionTypesEnum.UPDATE_GAME_ELEMENTS_ACTION,
    gameElements
  };
}
