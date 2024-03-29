import produce from 'immer';
import {Reducer} from 'redux';

import {KeyCodesEnum} from '../../type';
import {KeyboardAction, KeyboardActionTypesEnum} from './action';

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
  [KeyCodesEnum.KEY_L]: initialKeyState,

  // Preference keys.
  [KeyCodesEnum.KEY_V]: initialKeyState
};

const initialState: KeyboardState = {
  keyStateMap: initialKeyStateMap
};

// We use a set to quickly validate if keys are mapped in the game.
const keyCodesSet = new Set(Object.values(KeyCodesEnum));

export const keyboardReducer: Reducer<KeyboardState, KeyboardAction> = produce(
  (state: KeyboardState, action: KeyboardAction) => {
    const {keyCode} = action;

    if (!keyCodesSet.has(keyCode)) return;

    switch (action.type) {
      case KeyboardActionTypesEnum.KEY_DOWN_ACTION: {
        const {keyStateMap} = state;
        const keyState = keyStateMap[keyCode];

        keyState.isActive = true;
        break;
      }
      case KeyboardActionTypesEnum.KEY_UP_ACTION: {
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
