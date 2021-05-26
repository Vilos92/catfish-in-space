import Matter from 'matter-js';

import {KeyboardState} from './store/keyboard/reducer';
import {getViewportDimension} from './store/viewport/selector';
import {Coordinate, Dimension, KeyCodesEnum} from './type';

/**
 * Types.
 */

// The direction state which can be computed from two opposing keys.
enum KeyDirectionsEnum {
  NEGATIVE = -1,
  NEUTRAL = 0,
  POSITIVE = 1
}

/**
 * Constants.
 */

export declare const VERSION: string;

// These forces are in Newtons / 1,000,000.
const STRAIGHT_THRUSTER_FORCE = 1000;
const SIDE_THRUSTER_FORCE = 10;

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

export function addForceToPlayerMatterBodyFromKeyboard(keyboard: KeyboardState, playerMatterBody: Matter.Body): void {
  const {keyStateMap} = keyboard;

  const downIsActive = keyStateMap[KeyCodesEnum.KEY_S].isActive;
  const upIsActive = keyStateMap[KeyCodesEnum.KEY_W].isActive;
  addStraightForceToPlayerMatterBody(downIsActive, upIsActive, playerMatterBody);

  const leftIsActive = keyStateMap[KeyCodesEnum.KEY_A].isActive;
  const rightIsActive = keyStateMap[KeyCodesEnum.KEY_D].isActive;
  addSideForceToPlayerMatterBody(leftIsActive, rightIsActive, playerMatterBody);
}

function addStraightForceToPlayerMatterBody(
  downIsActive: boolean,
  upIsActive: boolean,
  playerMatterBody: Matter.Body
): void {
  const straightDirection = calculateDirectionFromOpposingKeys(downIsActive, upIsActive);
  const straightThrusterForce = straightDirection * STRAIGHT_THRUSTER_FORCE;

  // Force should be in line with the direction of the ship.
  const xStraightForce = Math.cos(playerMatterBody.angle) * straightThrusterForce;
  const yStraightForce = Math.sin(playerMatterBody.angle) * straightThrusterForce;

  const playerStraightForceVector: Matter.Vector = {
    x: xStraightForce,
    y: yStraightForce
  };

  Matter.Body.applyForce(playerMatterBody, playerMatterBody.position, playerStraightForceVector);
}

function addSideForceToPlayerMatterBody(
  leftIsActive: boolean,
  rightIsActive: boolean,
  playerMatterBody: Matter.Body
): void {
  const sideDirection = calculateDirectionFromOpposingKeys(leftIsActive, rightIsActive);
  const sideThrusterForce = sideDirection * SIDE_THRUSTER_FORCE;

  // TODO: Compute this based on the width of the ship.
  // Positive is towards front of ship, whereas negative is towards rear.
  const thrusterDistanceFromCenter = -5;

  const thrusterCoordinate = {
    x: playerMatterBody.position.x + Math.cos(playerMatterBody.angle) * thrusterDistanceFromCenter,
    y: playerMatterBody.position.y + Math.sin(playerMatterBody.angle) * thrusterDistanceFromCenter
  };

  // If thruster is at back of ship, we reverse thrust to apply correct rotational force.
  const thrusterDirection = thrusterDistanceFromCenter < 0 ? -1 : 1;

  // Force should be perpendicular to where the ship is facing.
  const xSideForce = thrusterDirection * Math.cos(playerMatterBody.angle + Math.PI / 2) * sideThrusterForce;
  const ySideForce = thrusterDirection * Math.sin(playerMatterBody.angle + Math.PI / 2) * sideThrusterForce;

  const playerSideForceVector: Matter.Vector = {
    x: xSideForce,
    y: ySideForce
  };

  Matter.Body.applyForce(playerMatterBody, thrusterCoordinate, playerSideForceVector);
}

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

  // TODO: This computation incorrectly gives the player extra velocity at
  // when moving in a diagonal direction.

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

// For two key presses which oppose each other, determine the direction.
function calculateDirectionFromOpposingKeys(negativeIsActive: boolean, positiveIsActive: boolean): KeyDirectionsEnum {
  if (negativeIsActive === positiveIsActive) return KeyDirectionsEnum.NEUTRAL;

  // If only the negative parameter is active, return -1.
  if (negativeIsActive) return KeyDirectionsEnum.NEGATIVE;

  // If only the positive parameter is active, return 1.
  return KeyDirectionsEnum.POSITIVE;
}
