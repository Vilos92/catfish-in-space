import {GameElement} from '../../type';
import {ActionTypesEnum, PlayerAction} from './action';

export interface PlayerState {
  gameElement: GameElement;
}

export const initialState: PlayerState = {
  gameElement: {
    coordinate: {x: 0, y: 0}
  }
};

export function playerReducer(state: PlayerState = initialState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case ActionTypesEnum.UPDATE_PLAYER_COORDINATE_ACTION: {
      const gameElement: GameElement = {...state.gameElement, coordinate: action.coordinate};

      return {...state, gameElement};
    }
    case ActionTypesEnum.UPDATE_PLAYER_SPRITE_ACTION: {
      const gameElement: GameElement = {...state.gameElement, sprite: action.sprite};

      return {...state, gameElement};
    }
    default:
      return state;
  }
}
