import {GameElement} from '../../type';

export enum PlayerActionTypesEnum {
  UPDATE_PLAYER_GAME_ELEMENT_ACTION = 'UPDATE_PLAYER_GAME_ELEMENT_ACTION'
}

export interface UpdatePlayerGameElementAction {
  type: PlayerActionTypesEnum.UPDATE_PLAYER_GAME_ELEMENT_ACTION;
  gameElement: GameElement;
}

export type PlayerAction = UpdatePlayerGameElementAction;

export function updatePlayerGameElementAction(gameElement: GameElement): UpdatePlayerGameElementAction {
  return {
    type: PlayerActionTypesEnum.UPDATE_PLAYER_GAME_ELEMENT_ACTION,
    gameElement
  };
}
