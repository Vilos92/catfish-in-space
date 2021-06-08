import produce from 'immer';
import {Reducer} from 'redux';
import {MouseButtonCodesEnum} from 'src/type';

import {MouseAction, MouseActionTypesEnum} from './action';

interface KeyState {
  isActive: boolean;
}

type KeyStateMap = {
  [index: number]: KeyState;
};

export interface MouseState {
  buttonStateMap: KeyStateMap;
}

const mouseButtonCodes = Object.values(MouseButtonCodesEnum);

const initialButtonState = {isActive: false};
const initialButtonStateMap = Object.assign(
  {},
  ...mouseButtonCodes.map(mouseKey => ({[mouseKey]: initialButtonState}))
);

const initialState: MouseState = {
  buttonStateMap: initialButtonStateMap
};

// We use a set to quickly validate if keys are mapped in the game.
const mouseKeysSet = new Set(mouseButtonCodes);

export const mouseReducer: Reducer<MouseState, MouseAction> = produce((state: MouseState, action: MouseAction) => {
  const {buttonCode} = action;

  if (!mouseKeysSet.has(buttonCode)) return;

  switch (action.type) {
    case MouseActionTypesEnum.MOUSE_BUTTON_DOWN_ACTION: {
      const {buttonStateMap} = state;
      const keyState = buttonStateMap[buttonCode];

      keyState.isActive = true;
      break;
    }
    case MouseActionTypesEnum.MOUSE_BUTTON_UP_ACTION: {
      const {buttonStateMap: keyStateMap} = state;
      const keyState = keyStateMap[buttonCode];

      keyState.isActive = false;
      break;
    }
    default:
  }
}, initialState);
