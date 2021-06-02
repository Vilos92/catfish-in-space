/**
 * Constants.
 */

export declare const VERSION: string;

/**
 * Helpers.
 */

/**
 * For an angle which can extend infinitely positive or negative, compute
 * the bounded angle which is between 0 and PI to simplify calculations.
 */
export function computeBoundAngle(angle: number): number {
  const boundAngle = angle % (2 * Math.PI);
  if (boundAngle < 0) return (2 * Math.PI + boundAngle) % (2 * Math.PI);
  return boundAngle;
}

/**
 * Compute the smallest angle between two angles. Response is a
 * value between -PI and PI.
 */
export function computeAngleBetween(angleA: number, angleB: number): number {
  const angleDiff = angleA - angleB;

  if (angleDiff > Math.PI) return -2 * Math.PI + angleDiff;
  else if (angleDiff < -Math.PI) return 2 * Math.PI + angleDiff;

  return angleDiff;
}