import {ActionTypesEnum, KeyboardActions, KeyCodesEnum} from './action';

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
  [KeyCodesEnum.KeyA]: {isActive: false},
  [KeyCodesEnum.KeyD]: {isActive: false},
  [KeyCodesEnum.KeyS]: {isActive: false},
  [KeyCodesEnum.KeyW]: {isActive: false}
};

const initialState: KeyboardState = {
  keyStateMap: initialKeyStateMap
};

export function keyboardReducer(state: KeyboardState = initialState, action: KeyboardActions): KeyboardState {
  switch (action.type) {
    case ActionTypesEnum.KEY_DOWN_ACTION: {
      const {keyStateMap} = state;
      const keyState = keyStateMap[action.keyCodesEnum];

      const newKeyState = {...keyState, isActive: true};
      const newKeyStateMap = {...state.keyStateMap, [action.keyCodesEnum]: newKeyState};

      return {...state, keyStateMap: newKeyStateMap};
    }
    case ActionTypesEnum.KEY_UP_ACTION: {
      const {keyStateMap} = state;
      const keyState = keyStateMap[action.keyCodesEnum];

      const newKeyState = {...keyState, isActive: false};
      const newKeyStateMap = {...state.keyStateMap, [action.keyCodesEnum]: newKeyState};

      return {...state, keyStateMap: newKeyStateMap};
    }
    default:
      return state;
  }
}
