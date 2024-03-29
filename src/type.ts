import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

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
  KEY_L = 'KeyL',

  // Preferences.
  KEY_V = 'KeyV'
}

/**
 * Mouse Button Events.
 */

export enum MouseButtonCodesEnum {
  MOUSE_BUTTON_PRIMARY = 0,
  MOUSE_BUTTON_AUXILARY = 1,
  MOUSE_BUTTON_SECONDARY = 2
}

/**
 * Callbacks.
 */

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

export interface Velocity {
  x: number;
  y: number;
}

export interface Dimension {
  width: number;
  height: number;
}

export interface Rectangle {
  topLeft: Coordinate;
  bottomRight: Coordinate;
}

interface Element {
  // This is the coordinate in our game, not the canvas.
  coordinate: Coordinate;
  // This is in radians. Default orientation (0) is facing right.
  rotation: number;
}

/**
 * Element which is extended to have a display component.
 */
export interface DisplayElement extends Element {
  pixiSprite: PixiSprite;
}

export interface LiveElement extends DisplayElement {
  // A unique id which can be used to update elements directly.
  id: string;
  // Timestamp at which the element was created - used for pruning things like bullets.
  timestamp: number;
  // This represents how much damage the element can receive before
  // being destroyed. An undefined value means the element is indestructible.
  health?: number;
}

/**
 * Types which define how one element impacts other elements on collision.
 */
export enum CollisionTypesEnum {
  BODY = 'BODY',
  PLAYER = 'PLAYER',
  PROJECTILE = 'PROJECTILE'
}

/**
 * Element which has a physics component in addition to the display component.
 */
export interface PhysicsElement extends LiveElement {
  collisionType: CollisionTypesEnum;
  matterBody: Matter.Body;
}

export type GameElement = LiveElement | PhysicsElement;

export function isPhysicsElement(gameElement: GameElement): gameElement is PhysicsElement {
  return 'matterBody' in gameElement;
}

/**
 * PIXI.
 */

/**
 * PixiSprite is used instead of PIXI.DisplayObject, as we only use PIXI elements
 * which have properties such as width and height.
 */
export type PixiSprite = PIXI.Graphics | PIXI.Sprite | PIXI.Text;

export type Renderer = PIXI.Renderer | PIXI.AbstractRenderer;
