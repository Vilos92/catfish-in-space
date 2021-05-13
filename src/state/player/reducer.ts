import {GameSprite} from '../../type';
import {ActionTypesEnum, PlayerAction} from './action';

export interface PlayerState {
  gameSprite: GameSprite;
}

export const initialState: PlayerState = {
  gameSprite: {
    coordinate: {x: 0, y: 0}
  }
};

export function playerReducer(state: PlayerState = initialState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case ActionTypesEnum.UPDATE_PLAYER_COORDINATE_ACTION: {
      const gameSprite: GameSprite = {...state.gameSprite, coordinate: action.coordinate};

      return {...state, gameSprite};
    }
    case ActionTypesEnum.UPDATE_PLAYER_SPRITE_ACTION: {
      const gameSprite: GameSprite = {...state.gameSprite, sprite: action.sprite};

      return {...state, gameSprite};
    }
    default:
      return state;
  }
}
