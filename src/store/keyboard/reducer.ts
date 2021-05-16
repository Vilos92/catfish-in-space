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

const initialKeyState = {isActive: false};

const initialKeyStateMap = {
  // Player movement.
  [KeyCodesEnum.KeyA]: initialKeyState,
  [KeyCodesEnum.KeyD]: initialKeyState,
  [KeyCodesEnum.KeyS]: initialKeyState,
  [KeyCodesEnum.KeyW]: initialKeyState,

  // Viewport movement.
  [KeyCodesEnum.KeyI]: initialKeyState,
  [KeyCodesEnum.KeyJ]: initialKeyState,
  [KeyCodesEnum.KeyK]: initialKeyState,
  [KeyCodesEnum.KeyL]: initialKeyState
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
