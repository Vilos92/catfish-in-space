import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import laserBullet1Shape from '../../assets/sprites/laserBullet1.json';
import {CollisionTypesEnum, Coordinate, GameElement, Velocity} from '../type';
import {createUuid} from '../utility';
import {calculatePositionRelativeToViewport} from '../utility/viewport';

export function createLaserBulletGameElement(
  viewportCoordinate: Coordinate,
  playerWidth: number,
  playerCoordinate: Coordinate,
  playerRotation: number,
  playerVelocity: Velocity
): GameElement {
  // Bullet should be in front of the player.
  const initialLaserCoordinate = {
    x: playerCoordinate.x + (Math.cos(playerRotation) * playerWidth) / 2 + 5,
    y: playerCoordinate.y + (Math.sin(playerRotation) * playerWidth) / 2 + 5
  };

  const initialLaserVelocity = {
    x: playerVelocity.x + Math.cos(playerRotation) * 50,
    y: playerVelocity.y + Math.sin(playerRotation) * 50
  };

  const laserPosition = calculatePositionRelativeToViewport(initialLaserCoordinate, viewportCoordinate);

  const laserPixi = new PIXI.Sprite(PIXI.Texture.from('laserBullet1'));
  laserPixi.scale.set(0.5, 0.5);
  laserPixi.anchor.set(0.5, 0.5);

  laserPixi.position.set(laserPosition.x, laserPosition.y);
  laserPixi.rotation = playerRotation;

  const laserMatter = Matter.Bodies.circle(
    // Game and matter coordinates have a one-to-one mapping.
    initialLaserCoordinate.x,
    initialLaserCoordinate.y,
    laserBullet1Shape.laserBullet1.fixtures[0].circle.radius,
    {
      // Approximate mass of Falcon 9.
      mass: 0.1,
      angle: playerRotation
    }
  );

  Matter.Body.setVelocity(laserMatter, initialLaserVelocity);

  return {
    id: createUuid(),
    coordinate: initialLaserCoordinate,
    rotation: playerRotation,
    matterBody: laserMatter,
    collisionType: CollisionTypesEnum.PROJECTILE,
    health: 1,
    pixiSprite: laserPixi
  };
}
