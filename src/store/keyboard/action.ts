import {KeyCodesEnum} from '../../type';

export enum ActionTypesEnum {
  KEY_DOWN_ACTION = 'KEY_DOWN_ACTION',
  KEY_UP_ACTION = 'KEY_UP_ACTION'
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
