import * as PIXI from 'pixi.js';
import {Action, Dispatch} from 'redux';

export interface Callback {
  (): void;
}

export interface CallbackWithArg<T> {
  (arg: T): void;
}

/**
 * Game world.
 */

export interface Coordinate {
  x: number;
  y: number;
}

export interface Dimension {
  width: number;
  height: number;
}

export interface GameElement {
  // This is the coordinate in our game, not the canvas.
  coordinate: Coordinate;
  sprite?: PIXI.AnimatedSprite;
}

/**
 * Keyboard Events.
 */

export enum KeyCodesEnum {
  // Player movement.
  KEY_A = 'KeyA',
  KEY_D = 'KeyD',
  KEY_S = 'KeyS',
  KEY_W = 'KeyW',

  // Viewport movement.
  KEY_I = 'KeyI',
  KEY_J = 'KeyJ',
  KEY_K = 'KeyK',
  KEY_L = 'KeyL'
}

/**
 * PIXI.
 */

export type Renderer = PIXI.Renderer | PIXI.AbstractRenderer;

/**
 * Helpers.
 */

export function makePayloadActionCallback<A extends Action, P>(
  dispatch: Dispatch<A>,
  actionCreator: (payload: P) => A
): CallbackWithArg<P> {
  return (payload: P) => dispatch(actionCreator(payload));
}
