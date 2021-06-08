export enum MouseActionTypesEnum {
  MOUSE_BUTTON_DOWN_ACTION = 'MOUSE_BUTTON_DOWN_ACTION',
  MOUSE_BUTTON_UP_ACTION = 'MOUSE_BUTTON_UP_ACTION'
}

export interface MouseButtonDownAction {
  type: MouseActionTypesEnum.MOUSE_BUTTON_DOWN_ACTION;
  buttonCode: number;
}

export interface MouseButtonUpAction {
  type: MouseActionTypesEnum.MOUSE_BUTTON_UP_ACTION;
  buttonCode: number;
}

export type MouseAction = MouseButtonDownAction | MouseButtonUpAction;

export function mouseButtonDownAction(buttonCode: number): MouseButtonDownAction {
  return {
    type: MouseActionTypesEnum.MOUSE_BUTTON_DOWN_ACTION,
    buttonCode
  };
}

export function mouseButtonUpAction(buttonCode: number): MouseButtonUpAction {
  return {
    type: MouseActionTypesEnum.MOUSE_BUTTON_UP_ACTION,
    buttonCode
  };
}
