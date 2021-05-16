import produce from 'immer';
import {Reducer} from 'redux';

import {KeyCodesEnum} from '../../type';
import {ActionTypesEnum, KeyboardAction} from './action';

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
  [KeyCodesEnum.KEY_A]: initialKeyState,
  [KeyCodesEnum.KEY_D]: initialKeyState,
  [KeyCodesEnum.KEY_S]: initialKeyState,
  [KeyCodesEnum.KEY_W]: initialKeyState,

  // Viewport movement.
  [KeyCodesEnum.KEY_I]: initialKeyState,
  [KeyCodesEnum.KEY_J]: initialKeyState,
  [KeyCodesEnum.KEY_K]: initialKeyState,
  [KeyCodesEnum.KEY_L]: initialKeyState
};

const initialState: KeyboardState = {
  keyStateMap: initialKeyStateMap
};

// We use a set to quickly validate of keys are mapped in the game.
const keyCodesSet = new Set(Object.values(KeyCodesEnum));

export const keyboardReducer: Reducer<KeyboardState, KeyboardAction> = produce(
  (state: KeyboardState, action: KeyboardAction) => {
    const {keyCode} = action;

    if (!keyCodesSet.has(keyCode)) return;

    switch (action.type) {
      case ActionTypesEnum.KEY_DOWN_ACTION: {
        const {keyStateMap} = state;
        const keyState = keyStateMap[keyCode];

        keyState.isActive = true;
        break;
      }
      case ActionTypesEnum.KEY_UP_ACTION: {
        const {keyStateMap} = state;
        const keyState = keyStateMap[keyCode];

        keyState.isActive = false;
        break;
      }
      default:
    }
  },
  initialState
);
