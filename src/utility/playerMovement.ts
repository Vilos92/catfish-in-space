import Matter from 'matter-js';

import {Dispatch} from '../store/gameReducer';
import {KeyboardState} from '../store/keyboard/reducer';
import {updatePlayerPidStateAction} from '../store/player/action';
import {Coordinate, KeyCodesEnum} from '../type';
import {computeAngleBetween, computeBoundAngle} from './';
import {calculateDirectionFromOpposingKeys} from './keyboard';
import {createComputeNextPidState, PidState} from './pid';
import {calculatePositionRelativeToViewport} from './viewport';

/**
 * Constants.
 */

// These forces are in Newtons / 1,000,000.
const straightThrusterForceLimit = 1000;
const sideThrusterForceLimit = 500;
const turnThrusterForceLimit = 10;

// PID tuning for the ship turn thrusters.
const pidConfig = {
  kp: 0.1,
  ki: 0.1,
  kd: 0.1,
  dt: 1 / 60 // every 1 / 60 seconds.
};

/**
 * Force based movement functions.
 */

const computeNextPidState = createComputeNextPidState(pidConfig);

export function addForceToPlayerMatterBodyFromMouseCoordinate(
  dispatch: Dispatch,
  mouseCoordinate: Coordinate,
  viewportCoordinate: Coordinate,
  playerMatterBody: Matter.Body,
  pidState: PidState
): void {
  const angleError = computePlayerAngleError(mouseCoordinate, viewportCoordinate, playerMatterBody);
  const nextPidState = computeNextPidState(pidState, angleError);

  const sideThrusterForce = nextPidState.output * turnThrusterForceLimit;

  // TODO: Compute the thrusterDistanceFromCenter based on the length of the ship.
  addSideForceToPlayerMatterBody(playerMatterBody, sideThrusterForce, -2.5);

  // Update the player's current PID state.
  dispatch(updatePlayerPidStateAction(nextPidState));
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

  const playerRotation = computeBoundAngle(playerAngle);

  const angleBetween = computeAngleBetween(playerMouseAngle, playerRotation);

  // angleDiff can be between -PI and PI, so we do this to get a percentage away from the target.
  return angleBetween / Math.PI;
}

export function addForceToPlayerMatterBodyFromKeyboard(
  keyboard: KeyboardState,
  playerMatterBody: Matter.Body
): boolean {
  const {keyStateMap} = keyboard;

  // Forward and back.
  const downIsActive = keyStateMap[KeyCodesEnum.KEY_S].isActive;
  const upIsActive = keyStateMap[KeyCodesEnum.KEY_W].isActive;
  const straightDirection = calculateDirectionFromOpposingKeys(downIsActive, upIsActive);
  const straightThrusterForce = straightDirection * straightThrusterForceLimit;
  addStraightForceToPlayerMatterBody(playerMatterBody, straightThrusterForce);

  // Strafing.
  const leftIsActive = keyStateMap[KeyCodesEnum.KEY_A].isActive;
  const rightIsActive = keyStateMap[KeyCodesEnum.KEY_D].isActive;
  const sideDirection = calculateDirectionFromOpposingKeys(leftIsActive, rightIsActive);
  const sideThrusterForce = sideDirection * sideThrusterForceLimit;
  addSideForceToPlayerMatterBody(playerMatterBody, sideThrusterForce);

  return straightThrusterForce !== 0 || sideThrusterForce !== 0;
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
