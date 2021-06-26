import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import {createLaserBulletGameElement} from '../element/laserBullet';
import {Dispatch} from '../store/gameReducer';
import {Coordinate, Dimension, GameElement} from '../type';
import {addGameElement} from '.';
import {createSound, setSoundCoordinate, SoundTypesEnum} from './audio';

/**
 * Constants.
 */

export const fireBufferPeriod = 250; // 0.25 seconds.

/**
 * Laser bullet helpers.
 */

export function firePlayerLaserBullet(
  dispatch: Dispatch,
  world: Matter.World,
  stage: PIXI.Container,
  viewportCoordinate: Coordinate,
  playerPixiSprite: PIXI.DisplayObject,
  playerMatterBody: Matter.Body
): GameElement {
  const laserBullet = createLaserBulletGameElement(
    viewportCoordinate,
    playerPixiSprite.getBounds().width,
    playerMatterBody.position,
    playerMatterBody.angle,
    playerMatterBody.velocity
  );
  addGameElement(dispatch, world, stage, laserBullet);

  return laserBullet;
}

/**
 * Fire laser bullet relative to current viewport
 */
export function playLaserBulletSound(
  laserBulletCoordinate: Coordinate,
  viewportCoordinate: Coordinate,
  viewportDimension: Dimension
): void {
  const laserBulletSound = createSound(SoundTypesEnum.LASER_BULLET);
  const spatialSound = setSoundCoordinate(
    laserBulletSound,
    laserBulletCoordinate,
    viewportCoordinate,
    viewportDimension
  );
  spatialSound.play();
}
