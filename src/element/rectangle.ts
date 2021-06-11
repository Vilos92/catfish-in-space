import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import {CollisionTypesEnum, Coordinate, PhysicsElement} from '../type';
import {createUuid} from '../utility';
import {calculatePositionRelativeToViewport} from '../utility/viewport';

export function createRectangleGameElement(viewportCoordinate: Coordinate, coordinate: Coordinate): PhysicsElement {
  const width = 300;
  const height = 200;
  const rotation = Math.random() * (2 * Math.PI);

  const position = calculatePositionRelativeToViewport(coordinate, viewportCoordinate);

  const graphics = new PIXI.Graphics();

  graphics.beginFill(0xa9a9a9);
  graphics.lineStyle(5, 0xa9a9a9);
  // MatterJS centers automatically, whereas with PixiJS we must set anchor or shift by half of width and height.
  graphics.drawRect(position.x, position.y, width, height);
  graphics.endFill();
  graphics.pivot.set(position.x + width / 2, position.y + height / 2);

  graphics.rotation = rotation;

  const matter = Matter.Bodies.rectangle(coordinate.x, coordinate.y, graphics.width, graphics.height, {
    mass: 550000,
    angle: rotation
  });

  return {
    id: createUuid(),
    coordinate: coordinate,
    rotation,
    matterBody: matter,
    collisionType: CollisionTypesEnum.BODY,
    pixiSprite: graphics,
    health: 200
  };
}
