import {KeyboardState} from '../store/keyboard/reducer';
import {getViewportDimension} from '../store/viewport/selector';
import {Coordinate, Dimension, KeyCodesEnum} from '../type';
import {calculateDirectionFromOpposingKeys, KeyDirectionsEnum} from './keyboard';

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

/**
 * Determine the location of the viewport while scaling its position by a parallax ratio.
 */
export function calculateParallaxViewportCoordinate(viewportCoordinate: Coordinate, parallaxRatio: number): Coordinate {
  // Not flooring the results will lead to a large number of overlapping stars in the Star Field.
  return {
    x: Math.floor(viewportCoordinate.x * (1.0 / parallaxRatio)),
    y: Math.floor(viewportCoordinate.y * (1.0 / parallaxRatio))
  };
}

/**
 * Determine the position relative to the center of the viewport by computing a sprite's position relative to the center.
 * Needed for spatial audio, where the center of the viewport is the listener.
 */
export function calculatePositionRelativeToViewportCenter(
  coordinate: Coordinate,
  viewportCoordinate: Coordinate,
  viewportDimension: Dimension
): Coordinate {
  return calculatePositionRelativeToViewport(
    coordinate,
    calculateViewportCenter(viewportCoordinate, viewportDimension)
  );
}

function calculateViewportCenter(viewportCoordinate: Coordinate, viewportDimension: Dimension): Coordinate {
  return {
    x: viewportCoordinate.x / viewportDimension.width,
    y: viewportCoordinate.y / viewportDimension.height
  };
}

/**
 * Movement of viewport from keyboard inputs.
 */

export function calculateUpdatedViewportCoordinateFromKeyboard(
  keyboard: KeyboardState,
  viewportCoordinate: Coordinate
): Coordinate {
  const {keyStateMap} = keyboard;

  const leftIsActive = keyStateMap[KeyCodesEnum.KEY_J].isActive;
  const rightIsActive = keyStateMap[KeyCodesEnum.KEY_L].isActive;
  const upIsActive = keyStateMap[KeyCodesEnum.KEY_I].isActive;
  const downIsActive = keyStateMap[KeyCodesEnum.KEY_K].isActive;

  const xDirection = calculateDirectionFromOpposingKeys(leftIsActive, rightIsActive);
  const yDirection = calculateDirectionFromOpposingKeys(upIsActive, downIsActive);

  const viewportDelta = calculateViewportDelta(xDirection, yDirection);

  return {
    x: viewportCoordinate.x + viewportDelta.x,
    y: viewportCoordinate.y + viewportDelta.y
  };
}

function calculateViewportDelta(xDirection: KeyDirectionsEnum, yDirection: KeyDirectionsEnum): Coordinate {
  const viewportDimension = getViewportDimension();
  const {width, height} = viewportDimension;

  // Overall max delta is based on the minimum screen dimension.
  const maxDelta = Math.min(width, height) / 20;

  // Delta along each axis with direction accounted for.
  const xDelta = xDirection * maxDelta;
  const yDelta = yDirection * maxDelta;

  // If both x and y axis have active key presses, we must compute from the diagonal delta.
  if (xDirection !== KeyDirectionsEnum.NEUTRAL && yDirection !== KeyDirectionsEnum.NEUTRAL) {
    const angle = Math.atan2(height, width);

    return {
      x: Math.cos(angle) * xDelta,
      y: Math.sin(angle) * yDelta
    };
  }

  return {
    x: xDelta,
    y: yDelta
  };
}
