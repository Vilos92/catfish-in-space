import {Coordinate, Dimension, GameSprite} from './type';

/**
 * Determine a new position for the viewport taking account the
 * screen dimension, and keeping the game sprite centered.
 */
export function calculateViewportCoordinate(gameSprite: GameSprite, screenDimension: Dimension): Coordinate {
  const x = gameSprite.coordinate.x - screenDimension.width / 2;
  const y = gameSprite.coordinate.y - screenDimension.height / 2;

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
