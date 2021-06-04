import * as PIXI from 'pixi.js';

import {StarField} from '../store/backgroundStage/reducer';
import {Coordinate, Dimension, GameElement, Rectangle} from '../type';
import {calculatePositionRelativeToViewport} from './viewport';

/**
 * Constants.
 */

// Do not erase stars until it is outside a threshold of the screen to:
// 1. Ensure stars at the edge of the screen do not "pop-in" to existence.
// 2. Make it less obvious that the stars are randomly generated, if moving back and forth.
const STARFIELD_BUFFER = 32;

export const BACKGROUND_PARALLAX_RATIO = 0.1;

/**
 * Functions.
 */

/**
 * Prune any stars which are outside the current viewport (with buffer).
 */
export function pruneStarField(starField: StarField, minCoordinate: Coordinate, maxCoordinate: Coordinate): void {
  const rows = starField.keys();
  for (const row of rows) {
    const cols = starField.get(row)?.keys();
    if (!cols) continue;

    for (const col of cols) {
      const starGameElement = starField.get(row)?.get(col);

      if (!starGameElement) continue;

      if (row < minCoordinate.y || row > maxCoordinate.y || col < minCoordinate.x || col > maxCoordinate.x) {
        starGameElement.pixiSprite.destroy();
        starField.get(row)?.delete(col);

        continue;
      }
    }

    // If no more columns remain for a row, we no longer need it in the Star Field.
    if (starField.get(row)?.size === 0) starField.delete(row);
  }
}

/**
 * Reposition the stars relative to the viewport.
 * Return the current boundaries of the Star Field in the form of a Rectangle.
 */
export function repositionStarField(viewportCoordinate: Coordinate, starField: StarField): Rectangle {
  let starFieldRowMin: number | undefined;
  let starFieldRowMax: number | undefined;

  let starFieldColMin: number | undefined;
  let starFieldColMax: number | undefined;

  const rows = starField.keys();
  for (const row of rows) {
    if (!starField.has(row)) {
      starField.set(row, new Map<number, GameElement>());
    }
    const cols = starField.get(row)?.keys();
    if (!cols) continue;

    for (const col of cols) {
      const starGameElement = starField.get(row)?.get(col);

      if (!starGameElement) continue;

      const newPosition = calculatePositionRelativeToViewport(starGameElement.coordinate, viewportCoordinate);
      starGameElement.pixiSprite.position.set(newPosition.x, newPosition.y);

      starFieldRowMin = starFieldRowMin ? Math.min(starFieldRowMin, row) : row;
      starFieldRowMax = starFieldRowMax ? Math.max(starFieldRowMax, row) : row;
      starFieldColMin = starFieldColMin ? Math.min(starFieldColMin, col) : col;
      starFieldColMax = starFieldColMax ? Math.max(starFieldColMax, col) : col;
    }
  }

  if (
    starFieldRowMin === undefined ||
    starFieldRowMax === undefined ||
    starFieldColMin === undefined ||
    starFieldColMax === undefined
  ) {
    throw new Error('No stars were found in the Star Field.');
  }

  return {
    topLeft: {x: starFieldColMin, y: starFieldRowMin},
    bottomRight: {x: starFieldColMax, y: starFieldRowMax}
  };
}

/**
 * Add stars to the empty portions of the viewport (with the included buffer).
 */
export function populateStarField(
  backgroundStage: PIXI.Container,
  viewportCoordinate: Coordinate,
  starField: StarField,
  minCoordinate: Coordinate,
  maxCoordinate: Coordinate,
  starFieldMinCoordinate: Coordinate,
  starFieldMaxCoordinate: Coordinate
): void {
  if (minCoordinate.y < starFieldMinCoordinate.y) {
    // Insert rows below current min.
    for (let y = minCoordinate.y; y < starFieldMinCoordinate.y; y++) {
      for (let x = minCoordinate.x; x < maxCoordinate.x; x++) {
        addStarToField(backgroundStage, viewportCoordinate, starField, x, y);
      }
    }
  }

  if (maxCoordinate.y > starFieldMaxCoordinate.y) {
    // Insert rows above current max.
    for (let y = starFieldMaxCoordinate.y + 1; y <= maxCoordinate.y; y++) {
      for (let x = minCoordinate.x; x < maxCoordinate.x; x++) {
        addStarToField(backgroundStage, viewportCoordinate, starField, x, y);
      }
    }
  }

  if (minCoordinate.x < starFieldMinCoordinate.x) {
    // Insert cols below current min.
    for (let x = minCoordinate.x; x < starFieldMinCoordinate.x; x++) {
      for (let y = minCoordinate.y; y < maxCoordinate.y; y++) {
        addStarToField(backgroundStage, viewportCoordinate, starField, x, y);
      }
    }
  }

  if (maxCoordinate.x > starFieldMaxCoordinate.x) {
    // Insert cols above current max.
    for (let x = starFieldMaxCoordinate.x + 1; x <= maxCoordinate.x; x++) {
      for (let y = minCoordinate.y; y < maxCoordinate.y; y++) {
        addStarToField(backgroundStage, viewportCoordinate, starField, x, y);
      }
    }
  }
}

export function addStarsToField(
  backgroundStage: PIXI.Container,
  viewportCoordinate: Coordinate,
  starField: StarField,
  minCoordinate: Coordinate,
  maxCoordinate: Coordinate
): void {
  // Insert between rowMin and rowMax
  for (let y = minCoordinate.y; y <= maxCoordinate.y; y++) {
    for (let x = minCoordinate.x; x <= maxCoordinate.x; x++) {
      addStarToField(backgroundStage, viewportCoordinate, starField, x, y);
    }
  }
}

function addStarToField(
  backgroundStage: PIXI.Container,
  viewportCoordinate: Coordinate,
  starField: StarField,
  x: number,
  y: number
): void {
  // Create a row in the Star Field if we do not already have one.
  if (!starField.has(y)) starField.set(y, new Map<number, GameElement>());

  // If we already have a star at this location, skip.
  if (starField.get(y)?.has(x)) return;

  if (Math.random() > 1 / 256) return;

  const coordinate = {x, y};
  const star = createStarGraphic(viewportCoordinate, coordinate);

  starField.get(y)?.set(x, {
    coordinate,
    rotation: 0,
    pixiSprite: star
  });

  starField.get(y)?.set(x, {
    coordinate,
    rotation: 0,
    pixiSprite: star
  });

  backgroundStage.addChild(star);
}

function createStarGraphic(viewportCoordinate: Coordinate, coordinate: Coordinate): PIXI.Graphics {
  const position = calculatePositionRelativeToViewport(coordinate, viewportCoordinate);

  const starSize = Math.random() * 2;
  const alpha = Math.random();

  const starGraphics = new PIXI.Graphics();
  starGraphics.beginFill(0xffffff, alpha);
  starGraphics.lineStyle(0, 0, 1.0);
  starGraphics.drawCircle(0, 0, starSize);
  starGraphics.endFill();
  starGraphics.position.set(position.x, position.y);

  return starGraphics;
}

export function calculateStarFieldBoundary(viewportCoordinate: Coordinate, viewportDimension: Dimension): Rectangle {
  const rowMin = viewportCoordinate.y - STARFIELD_BUFFER;
  const rowMax = viewportCoordinate.y + viewportDimension.height + STARFIELD_BUFFER;

  const colMin = viewportCoordinate.x - STARFIELD_BUFFER;
  const colMax = viewportCoordinate.x + viewportDimension.width + STARFIELD_BUFFER;

  return {
    topLeft: {x: colMin, y: rowMin},
    bottomRight: {x: colMax, y: rowMax}
  };
}

/**
 * Determine the location of the viewport while scaling its position by a parallax ratio.
 */
export function calculateParallaxViewportCoordinate(viewportCoordinate: Coordinate, parallaxRatio: number): Coordinate {
  // Not flooring the results will lead to a large number of overlapping stars in the Star Field.
  return {
    x: Math.floor(viewportCoordinate.x * parallaxRatio),
    y: Math.floor(viewportCoordinate.y * parallaxRatio)
  };
}
