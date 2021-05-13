import {Coordinate, Dimension} from './type';

/**
 * Constants.
 */

export declare const VERSION: string;

/**
 * Determine a new position for the viewport taking account the
 * screen dimension, and keeping the game element centered.
 */
export function calculateViewportCoordinate(gameElementCoordinate: Coordinate, screenDimension: Dimension): Coordinate {
  const x = gameElementCoordinate.x - screenDimension.width / 2;
  const y = gameElementCoordinate.y - screenDimension.height / 2;

  return {
    x,
    y
  };
}

/**
 * Determine the position in the canvas by computing a sprite's position relative to the viewport.
 */
export function calculatePositionRelativeToViewport(
  coordinate: Coordinate,
  viewportCoordinate: Coordinate
): Coordinate {
  return {
    x: coordinate.x - viewportCoordinate.x,
    y: coordinate.y - viewportCoordinate.y
  };
}
