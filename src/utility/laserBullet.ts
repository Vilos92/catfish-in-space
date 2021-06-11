import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import {createLaserBulletGameElement} from '../element/laserBullet';
import {Dispatch} from '../store/gameReducer';
import {updatePlayerPrimaryFireTimestampAction} from '../store/player/action';
import {Coordinate} from '../type';
import {addGameElement} from '.';
import {playSound, SoundTypesEnum} from './audio';

/**
 * Constants.
 */

const FIRE_BUFFER_PERIOD = 250; // 0.25 seconds.

/**
 * Laser bullet helpers.
 */

export function firePlayerLaserBullet(
  dispatch: Dispatch,
  world: Matter.World,
  stage: PIXI.Container,
  viewportCoordinate: Coordinate,
  playerPrimaryFireTimestamp: number,
  playerPixiSprite: PIXI.DisplayObject,
  playerMatterBody: Matter.Body
): void {
  // Lasers go pew.
  const now = Date.now();
  if (now <= playerPrimaryFireTimestamp + FIRE_BUFFER_PERIOD) return;

  const laserBullet = createLaserBulletGameElement(
    viewportCoordinate,
    playerPixiSprite.getBounds().width,
    playerMatterBody.position,
    playerMatterBody.angle,
    playerMatterBody.velocity
  );
  addGameElement(dispatch, world, stage, laserBullet);
  dispatch(updatePlayerPrimaryFireTimestampAction(now));

  playSound(SoundTypesEnum.LASER_BULLET);
}
