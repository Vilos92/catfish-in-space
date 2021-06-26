import Matter from 'matter-js';
import * as PIXI from 'pixi.js';
import {pushGameElementAction} from 'src/store/gameElement/action';
import {v4 as uuidv4} from 'uuid';

import {Dispatch} from '../store/gameReducer';
import {Dimension, GameElement, isPhysicsElement, PixiSprite} from '../type';

/**
 * Helpers.
 */

export function createUuid(): string {
  return uuidv4();
}

/**
 * For an angle which can extend infinitely positive or negative, compute
 * the bounded angle which is between 0 and PI to simplify calculations.
 */
export function computeBoundAngle(angle: number): number {
  const boundAngle = angle % (2 * Math.PI);
  if (boundAngle < 0) return (2 * Math.PI + boundAngle) % (2 * Math.PI);
  return boundAngle;
}

/**
 * Compute the smallest angle between two angles. Response is a
 * value between -PI and PI.
 */
export function computeAngleBetween(angleA: number, angleB: number): number {
  const angleDiff = angleA - angleB;

  if (angleDiff > Math.PI) return -2 * Math.PI + angleDiff;
  else if (angleDiff < -Math.PI) return 2 * Math.PI + angleDiff;

  return angleDiff;
}

export function addGameElement(
  dispatch: Dispatch,
  world: Matter.World,
  stage: PIXI.Container,
  gameElement: GameElement
): void {
  if (isPhysicsElement(gameElement)) Matter.Composite.add(world, gameElement.matterBody);

  stage.addChild(gameElement.pixiSprite);

  dispatch(pushGameElementAction(gameElement));
}

export function computePixiSpriteDimension(pixiSprite: PixiSprite): Dimension {
  return {
    width: pixiSprite.width,
    height: pixiSprite.height
  };
}
