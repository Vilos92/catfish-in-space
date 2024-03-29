import * as PIXI from 'pixi.js';

import {createStarGraphic} from '../element/star';
import {StarField} from '../store/backgroundStage/reducer';
import {Coordinate, Dimension, DisplayElement, Rectangle} from '../type';
import {calculateParallaxViewportCoordinate, calculatePositionRelativeToViewport} from './viewport';

/**
 * Constants.
 */

// Do not erase stars until it is outside a threshold of the screen to:
// 1. Ensure stars at the edge of the screen do not "pop-in" to existence.
// 2. Make it less obvious that the stars are randomly generated, if moving back and forth.
const STARFIELD_BUFFER = 32;

const STAR_CHANCE = 1 / 10;

export const BACKGROUND_PARALLAX_SCALE_A = 30;
export const BACKGROUND_PARALLAX_SCALE_B = 50;

/**
 * Functions.
 */

export function updateStarField(
  backgroundStage: PIXI.Container,
  viewportCoordinate: Coordinate,
  viewportDimension: Dimension,
  starField: StarField,
  parallaxScale = 30
): StarField {
  const updatedStarField = new Map(starField);

  const parallaxViewportCoordinate = calculateParallaxViewportCoordinate(viewportCoordinate, parallaxScale);

  const starFieldExpectedBoundary = calculateStarFieldBoundary(parallaxViewportCoordinate, viewportDimension);

  if (updatedStarField.size === 0)
    addStarsToField(
      backgroundStage,
      viewportCoordinate,
      updatedStarField,
      starFieldExpectedBoundary.topLeft,
      starFieldExpectedBoundary.bottomRight,
      parallaxScale
    );
  else {
    pruneStarField(updatedStarField, starFieldExpectedBoundary.topLeft, starFieldExpectedBoundary.bottomRight);

    const starFieldCurrentBoundary = repositionStarField(parallaxViewportCoordinate, updatedStarField);

    populateStarField(
      backgroundStage,
      parallaxViewportCoordinate,
      updatedStarField,
      starFieldExpectedBoundary.topLeft,
      starFieldExpectedBoundary.bottomRight,
      starFieldCurrentBoundary.topLeft,
      starFieldCurrentBoundary.bottomRight,
      parallaxScale
    );
  }

  return updatedStarField;
}

/**
 * Prune any stars which are outside the current viewport (with buffer).
 */
function pruneStarField(starField: StarField, minCoordinate: Coordinate, maxCoordinate: Coordinate): void {
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
function repositionStarField(viewportCoordinate: Coordinate, starField: StarField): Rectangle {
  let starFieldRowMin: number | undefined;
  let starFieldRowMax: number | undefined;

  let starFieldColMin: number | undefined;
  let starFieldColMax: number | undefined;

  const rows = starField.keys();
  for (const row of rows) {
    if (!starField.has(row)) {
      starField.set(row, new Map<number, DisplayElement>());
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
function populateStarField(
  backgroundStage: PIXI.Container,
  viewportCoordinate: Coordinate,
  starField: StarField,
  minCoordinate: Coordinate,
  maxCoordinate: Coordinate,
  starFieldMinCoordinate: Coordinate,
  starFieldMaxCoordinate: Coordinate,
  parallaxScale: number
): void {
  if (minCoordinate.y < starFieldMinCoordinate.y) {
    // Insert rows below current min.
    for (let y = minCoordinate.y; y < starFieldMinCoordinate.y; y++) {
      for (let x = minCoordinate.x; x < maxCoordinate.x; x++) {
        addStarToField(backgroundStage, viewportCoordinate, starField, x, y, parallaxScale);
      }
    }
  }

  if (maxCoordinate.y > starFieldMaxCoordinate.y) {
    // Insert rows above current max.
    for (let y = starFieldMaxCoordinate.y + 1; y <= maxCoordinate.y; y++) {
      for (let x = minCoordinate.x; x < maxCoordinate.x; x++) {
        addStarToField(backgroundStage, viewportCoordinate, starField, x, y, parallaxScale);
      }
    }
  }

  if (minCoordinate.x < starFieldMinCoordinate.x) {
    // Insert cols below current min.
    for (let x = minCoordinate.x; x < starFieldMinCoordinate.x; x++) {
      for (let y = minCoordinate.y; y < maxCoordinate.y; y++) {
        addStarToField(backgroundStage, viewportCoordinate, starField, x, y, parallaxScale);
      }
    }
  }

  if (maxCoordinate.x > starFieldMaxCoordinate.x) {
    // Insert cols above current max.
    for (let x = starFieldMaxCoordinate.x + 1; x <= maxCoordinate.x; x++) {
      for (let y = minCoordinate.y; y < maxCoordinate.y; y++) {
        addStarToField(backgroundStage, viewportCoordinate, starField, x, y, parallaxScale);
      }
    }
  }
}

function addStarsToField(
  backgroundStage: PIXI.Container,
  viewportCoordinate: Coordinate,
  starField: StarField,
  minCoordinate: Coordinate,
  maxCoordinate: Coordinate,
  parallaxScale: number
): void {
  // Insert between rowMin and rowMax
  for (let y = minCoordinate.y; y <= maxCoordinate.y; y++) {
    for (let x = minCoordinate.x; x <= maxCoordinate.x; x++) {
      addStarToField(backgroundStage, viewportCoordinate, starField, x, y, parallaxScale);
    }
  }
}

function addStarToField(
  backgroundStage: PIXI.Container,
  viewportCoordinate: Coordinate,
  starField: StarField,
  x: number,
  y: number,
  parallaxScale: number
): void {
  // Create a row in the Star Field if we do not already have one.
  if (!starField.has(y)) starField.set(y, new Map<number, DisplayElement>());

  // If we already have a star at this location, skip.
  if (starField.get(y)?.has(x)) return;

  if (Math.random() > STAR_CHANCE / parallaxScale) return;

  const coordinate = {x, y};
  const star = createStarGraphic(viewportCoordinate, coordinate, parallaxScale);

  starField.get(y)?.set(x, {
    coordinate,
    rotation: 0,
    pixiSprite: star
  });

  backgroundStage.addChild(star);
}

function calculateStarFieldBoundary(viewportCoordinate: Coordinate, viewportDimension: Dimension): Rectangle {
  const rowMin = viewportCoordinate.y - STARFIELD_BUFFER;
  const rowMax = viewportCoordinate.y + viewportDimension.height + STARFIELD_BUFFER;

  const colMin = viewportCoordinate.x - STARFIELD_BUFFER;
  const colMax = viewportCoordinate.x + viewportDimension.width + STARFIELD_BUFFER;

  return {
    topLeft: {x: colMin, y: rowMin},
    bottomRight: {x: colMax, y: rowMax}
  };
}
