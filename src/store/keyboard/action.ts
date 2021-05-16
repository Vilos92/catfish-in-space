export enum KeyCodesEnum {
  // Player movement.
  KeyA = 'KeyA',
  KeyD = 'KeyD',
  KeyS = 'KeyS',
  KeyW = 'KeyW',

  // Viewport movement.
  KeyI = 'KeyI',
  KeyJ = 'KeyJ',
  KeyK = 'KeyK',
  KeyL = 'KeyL'
}

export enum ActionTypesEnum {
  KEY_DOWN_ACTION = 'key_down_action',
  KEY_UP_ACTION = 'key_up_action'
}

export interface KeyDownAction {
  type: ActionTypesEnum.KEY_DOWN_ACTION;
  keyCode: KeyCodesEnum;
}

export interface KeyUpAction {
  type: ActionTypesEnum.KEY_UP_ACTION;
  keyCode: KeyCodesEnum;
}

export type KeyboardAction = KeyDownAction | KeyUpAction;

export function keyDownAction(keyCode: KeyCodesEnum): KeyDownAction {
  return {
    type: ActionTypesEnum.KEY_DOWN_ACTION,
    keyCode: keyCode
  };
}

export function keyUpAction(keyCode: KeyCodesEnum): KeyUpAction {
  return {
    type: ActionTypesEnum.KEY_UP_ACTION,
    keyCode: keyCode
  };
}
