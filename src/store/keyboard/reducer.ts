import produce from 'immer';
import {Reducer} from 'redux';

import {ActionTypesEnum, KeyboardAction, KeyCodesEnum} from './action';

interface KeyState {
  isActive: boolean;
}

type KeyStateMap = {
  [keyCode in KeyCodesEnum]: KeyState;
};

export interface KeyboardState {
  keyStateMap: KeyStateMap;
}

const initialKeyStateMap = {
  // Player movement.
  [KeyCodesEnum.KeyA]: {isActive: false},
  [KeyCodesEnum.KeyD]: {isActive: false},
  [KeyCodesEnum.KeyS]: {isActive: false},
  [KeyCodesEnum.KeyW]: {isActive: false},

  // Viewport movement.
  [KeyCodesEnum.KeyI]: {isActive: false},
  [KeyCodesEnum.KeyJ]: {isActive: false},
  [KeyCodesEnum.KeyK]: {isActive: false},
  [KeyCodesEnum.KeyL]: {isActive: false}
};

const initialState: KeyboardState = {
  keyStateMap: initialKeyStateMap
};

export const keyboardReducer: Reducer<KeyboardState, KeyboardAction> = produce(
  (state: KeyboardState, action: KeyboardAction) => {
    if (!(action.keyCode in KeyCodesEnum)) return;

    switch (action.type) {
      case ActionTypesEnum.KEY_DOWN_ACTION: {
        const {keyStateMap} = state;
        const keyState = keyStateMap[action.keyCode];

        keyState.isActive = true;
        break;
      }
      case ActionTypesEnum.KEY_UP_ACTION: {
        const {keyStateMap} = state;
        const keyState = keyStateMap[action.keyCode];

        keyState.isActive = false;
        break;
      }
      default:
    }
  },
  initialState
);
