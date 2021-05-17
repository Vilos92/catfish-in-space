import {Reducer} from 'redux';

import {GameElement} from '../../type';
import {ActionTypesEnum, PlayerAction} from './action';

export interface PlayerState {
  gameElement: GameElement;
}

export const initialState: PlayerState = {
  gameElement: {
    coordinate: {x: 0, y: 0},
    rotation: 0
  }
};

export const playerReducer: Reducer<PlayerState, PlayerAction> = (
  state: PlayerState = initialState,
  action: PlayerAction
) => {
  switch (action.type) {
    case ActionTypesEnum.UPDATE_PLAYER_COORDINATE_ACTION: {
      const {gameElement} = state;

      const updatedGameElement: GameElement = {...gameElement, coordinate: action.coordinate};

      return {...state, gameElement: updatedGameElement};
    }
    case ActionTypesEnum.UPDATE_PLAYER_ROTATION_ACTION: {
      const {gameElement} = state;

      const updatedGameElement: GameElement = {...gameElement, rotation: action.rotation};

      return {...state, gameElement: updatedGameElement};
    }
    case ActionTypesEnum.UPDATE_PLAYER_MATTER_BODY_ACTION: {
      const {gameElement} = state;

      const updatedGameElement: GameElement = {...gameElement, matterBody: action.matterBody};

      return {...state, gameElement: updatedGameElement};
    }
    case ActionTypesEnum.UPDATE_PLAYER_SPRITE_ACTION: {
      const {gameElement} = state;

      const updatedGameElement: GameElement = {...gameElement, pixiSprite: action.pixiSprite};

      return {...state, gameElement: updatedGameElement};
    }
    default:
      return state;
  }
};
