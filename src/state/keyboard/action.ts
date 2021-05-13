enum KeyCodesEnum {
  UP = '123',
  DOWN = '124'
}

export enum ActionTypesEnum {
  KEY_DOWN_ACTION = 'key_down_action',
  KEY_UP_ACTION = 'key_up_action'
}

export interface KeyDownAction {
  type: ActionTypesEnum.KEY_DOWN_ACTION;
  keyCodesEnum: KeyCodesEnum;
}

export interface KeyUpAction {
  type: ActionTypesEnum.KEY_UP_ACTION;
  keyCodesEnum: KeyCodesEnum;
}

export type KeyboardActions = KeyDownAction | KeyUpAction;

export function keyDownAction(keyCodesEnum: KeyCodesEnum): KeyDownAction {
  return {
    type: ActionTypesEnum.KEY_DOWN_ACTION,
    keyCodesEnum
  };
}

export function keyUpAction(keyCodesEnum: KeyCodesEnum): KeyUpAction {
  return {
    type: ActionTypesEnum.KEY_UP_ACTION,
    keyCodesEnum
  };
}
