import {GameElement} from '../../type';

export enum GameElementActionTypesEnum {
  PUSH_GAME_ELEMENT_ACTION = 'PUSH_GAME_ELEMENT_ACTION',
  UPDATE_GAME_ELEMENTS_ACTION = 'UPDATE_GAME_ELEMENTS_ACTION',
  UPDATE_GAME_ELEMENT_ACTION = 'UPDATE_GAME_ELEMENT_ACTION'
}

export interface PushGameElementAction {
  type: GameElementActionTypesEnum.PUSH_GAME_ELEMENT_ACTION;
  gameElement: GameElement;
}

export interface UpdateGameElementsAction {
  type: GameElementActionTypesEnum.UPDATE_GAME_ELEMENTS_ACTION;
  gameElements: ReadonlyArray<GameElement>;
}

export interface UpdateGameElementAction {
  type: GameElementActionTypesEnum.UPDATE_GAME_ELEMENT_ACTION;
  gameElement: GameElement;
}

export type GameElementAction = PushGameElementAction | UpdateGameElementsAction | UpdateGameElementAction;

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

export function updateGameElementAction(gameElement: GameElement): UpdateGameElementAction {
  return {
    type: GameElementActionTypesEnum.UPDATE_GAME_ELEMENT_ACTION,
    gameElement
  };
}
