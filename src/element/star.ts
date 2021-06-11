import * as PIXI from 'pixi.js';

import {Coordinate} from '../type';
import {calculatePositionRelativeToViewport} from '../utility/viewport';

export function createStarGraphic(
  viewportCoordinate: Coordinate,
  coordinate: Coordinate,
  parallaxScale: number
): PIXI.Graphics {
  const position = calculatePositionRelativeToViewport(coordinate, viewportCoordinate);

  const starSize = Math.floor((Math.random() * 80.0) / parallaxScale);
  const alpha = (Math.random() * 20.0) / parallaxScale;

  const starGraphics = new PIXI.Graphics();
  starGraphics.beginFill(0xffffff, alpha);
  starGraphics.lineStyle(0, 0, 1.0);
  starGraphics.drawCircle(0, 0, starSize);
  starGraphics.endFill();
  starGraphics.position.set(position.x, position.y);

  return starGraphics;
}
