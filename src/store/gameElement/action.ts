import {GameElement} from '../../type';

export enum GameElementActionTypesEnum {
  PUSH_GAME_ELEMENT_ACTION = 'PUSH_GAME_ELEMENT_ACTION'
}

export interface PushGameElementAction {
  type: GameElementActionTypesEnum.PUSH_GAME_ELEMENT_ACTION;
  gameElement: GameElement;
}

export type GameElementAction = PushGameElementAction;

export function pushGameElementAction(gameElement: GameElement): PushGameElementAction {
  return {
    type: GameElementActionTypesEnum.PUSH_GAME_ELEMENT_ACTION,
    gameElement
  };
}
