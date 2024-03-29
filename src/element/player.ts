import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import {CollisionTypesEnum, Coordinate, PhysicsElement} from '../type';
import {createUuid} from '../utility';
import {calculatePositionRelativeToViewport} from '../utility/viewport';

export function createPlayerGameElement(viewportCoordinate: Coordinate): PhysicsElement {
  // Player will start at the very center.
  const initialPlayerCoordinate = {x: 0, y: 0};

  const spaceshipPosition = calculatePositionRelativeToViewport(initialPlayerCoordinate, viewportCoordinate);

  const spaceshipPixi = new PIXI.Sprite(PIXI.Texture.from('spaceship'));
  spaceshipPixi.scale.set(0.5, 0.5);
  spaceshipPixi.anchor.set(0.5, 0.5);

  spaceshipPixi.position.set(spaceshipPosition.x, spaceshipPosition.y);

  const spaceshipMatter = Matter.Bodies.rectangle(
    // Game and matter coordinates have a one-to-one mapping.
    initialPlayerCoordinate.x,
    initialPlayerCoordinate.y,
    // nightraiderfixedShape.nightraiderfixed.fixtures[0].vertices,
    spaceshipPixi.width,
    spaceshipPixi.height,
    {
      // Approximate mass of Falcon 9.
      mass: 550000,
      frictionAir: 0
    }
  );

  return {
    id: createUuid(),
    timestamp: Date.now(),
    coordinate: initialPlayerCoordinate,
    rotation: 0,
    matterBody: spaceshipMatter,
    pixiSprite: spaceshipPixi,
    collisionType: CollisionTypesEnum.PLAYER,
    // health: 100
    health: 1 // test
  };
}
