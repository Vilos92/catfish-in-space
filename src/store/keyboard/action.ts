import {KeyCodesEnum} from '../../type';

export enum KeyboardActionTypesEnum {
  KEY_DOWN_ACTION = 'KEY_DOWN_ACTION',
  KEY_UP_ACTION = 'KEY_UP_ACTION'
}

export interface KeyDownAction {
  type: KeyboardActionTypesEnum.KEY_DOWN_ACTION;
  keyCode: KeyCodesEnum;
}

export interface KeyUpAction {
  type: KeyboardActionTypesEnum.KEY_UP_ACTION;
  keyCode: KeyCodesEnum;
}

export type KeyboardAction = KeyDownAction | KeyUpAction;

export function keyDownAction(keyCode: KeyCodesEnum): KeyDownAction {
  return {
    type: KeyboardActionTypesEnum.KEY_DOWN_ACTION,
    keyCode
  };
}

export function keyUpAction(keyCode: KeyCodesEnum): KeyUpAction {
  return {
    type: KeyboardActionTypesEnum.KEY_UP_ACTION,
    keyCode
  };
}
