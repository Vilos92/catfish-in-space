import * as PIXI from 'pixi.js';
import {Action, Dispatch} from 'redux';

export interface Callback {
  (): void;
}

export interface CallbackWithArg<T> {
  (arg: T): void;
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface Dimension {
  width: number;
  height: number;
}

export interface GameSprite {
  // This is the coordinate in our game, not the canvas.
  coordinate: Coordinate;
  sprite?: PIXI.AnimatedSprite;
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
