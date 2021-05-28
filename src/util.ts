import Matter from 'matter-js';

import {KeyboardState} from './store/keyboard/reducer';
import {getViewportDimension} from './store/viewport/selector';
import {Coordinate, Dimension, KeyCodesEnum} from './type';
import {createComputeNextPidState, PidState} from './util/pid';

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
const SIDE_THRUSTER_FORCE = 500;
const TURN_THRUSTER_FORCE = 10;

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

const kp = 0.75;
const ki = 0.5;
const kd = 0.5;
const dt = 1 / 60; // 60 frames per second.

const computeNextPidState = createComputeNextPidState({kp, ki, kd, dt});
let pidState: PidState = {integral: 0, output: 0, error: 0};

export function addForceToPlayerMatterBodyFromMouseCoordinate(
  mouseCoordinate: Coordinate,
  viewportCoordinate: Coordinate,
  playerMatterBody: Matter.Body
): void {
  const angleError = computePlayerAngleError(mouseCoordinate, viewportCoordinate, playerMatterBody);
  pidState = computeNextPidState(pidState, angleError);

  const sideThrusterForce = pidState.output * TURN_THRUSTER_FORCE;

  // TODO: Compute the thrusterDistanceFromCenter based on the length of the ship.
  addSideForceToPlayerMatterBody(playerMatterBody, sideThrusterForce, -5);
}

/**
 * Compute an error value between -1.0 and 1.0, which represents how
 * far off the ship is from being angled towards the user's cursor.
 */
function computePlayerAngleError(
  mouseCoordinate: Coordinate,
  viewportCoordinate: Coordinate,
  playerMatterBody: Matter.Body
): number {
  const {position: playerPosition, angle: playerAngle} = playerMatterBody;
  const playerRelativeToViewport = calculatePositionRelativeToViewport(playerPosition, viewportCoordinate);

  const playerMouseAngle =
    (2 * Math.PI + Matter.Vector.angle(playerRelativeToViewport, mouseCoordinate)) % (2 * Math.PI);
  const sign = playerAngle > 0 ? 1 : -1;
  let playerRotation = playerAngle % (2 * Math.PI);
  if (sign === -1) playerRotation = (2 * Math.PI + playerRotation) % (2 * Math.PI);
  let angleDiff = playerMouseAngle - playerRotation;

  if (angleDiff > Math.PI) angleDiff = -2 * Math.PI + angleDiff;
  else if (angleDiff < -Math.PI) angleDiff = 2 * Math.PI + angleDiff;

  // angleDiff can be between -PI and PI, so we do this to get a percentage away from the target.
  return angleDiff / Math.PI;
}

export function addForceToPlayerMatterBodyFromKeyboard(keyboard: KeyboardState, playerMatterBody: Matter.Body): void {
  const {keyStateMap} = keyboard;

  // Forward and back.
  const downIsActive = keyStateMap[KeyCodesEnum.KEY_S].isActive;
  const upIsActive = keyStateMap[KeyCodesEnum.KEY_W].isActive;
  const straightDirection = calculateDirectionFromOpposingKeys(downIsActive, upIsActive);
  const straightThrusterForce = straightDirection * STRAIGHT_THRUSTER_FORCE;
  addStraightForceToPlayerMatterBody(playerMatterBody, straightThrusterForce);

  // Strafing.
  const leftIsActive = keyStateMap[KeyCodesEnum.KEY_A].isActive;
  const rightIsActive = keyStateMap[KeyCodesEnum.KEY_D].isActive;
  const sideDirection = calculateDirectionFromOpposingKeys(leftIsActive, rightIsActive);
  const sideThrusterForce = sideDirection * SIDE_THRUSTER_FORCE;
  addSideForceToPlayerMatterBody(playerMatterBody, sideThrusterForce);
}

function addStraightForceToPlayerMatterBody(playerMatterBody: Matter.Body, straightThrusterForce: number): void {
  const {position: playerPosition, angle: playerAngle} = playerMatterBody;

  // Force should be in line with the direction of the ship.
  const xStraightForce = Math.cos(playerAngle) * straightThrusterForce;
  const yStraightForce = Math.sin(playerAngle) * straightThrusterForce;

  const playerStraightForceVector: Matter.Vector = {
    x: xStraightForce,
    y: yStraightForce
  };

  Matter.Body.applyForce(playerMatterBody, playerPosition, playerStraightForceVector);
}

/**
 * Add a side force to the player matter body. If a value other than 0 is
 * provided for the thrusterDistanceFromCenter, a torque will be applied.
 */
function addSideForceToPlayerMatterBody(
  playerMatterBody: Matter.Body,
  sideThrusterForce: number,
  thrusterDistanceFromCenter = 0
): void {
  const {position: playerPosition, angle: playerAngle} = playerMatterBody;

  const thrusterCoordinate = {
    x: playerPosition.x + Math.cos(playerAngle) * thrusterDistanceFromCenter,
    y: playerPosition.y + Math.sin(playerAngle) * thrusterDistanceFromCenter
  };

  // If thruster is at back of ship, we reverse thrust to apply correct rotational force.
  const thrusterDirection = thrusterDistanceFromCenter < 0 ? -1 : 1;

  // Force should be perpendicular to where the ship is facing.
  const xSideForce = thrusterDirection * Math.cos(playerAngle + Math.PI / 2) * sideThrusterForce;
  const ySideForce = thrusterDirection * Math.sin(playerAngle + Math.PI / 2) * sideThrusterForce;

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

  // If only the negative parameter is active, direction is negative.
  if (negativeIsActive) return KeyDirectionsEnum.NEGATIVE;

  // If only the positive parameter is active, direction is positive.
  return KeyDirectionsEnum.POSITIVE;
}
