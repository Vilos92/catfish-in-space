/**
 * Types.
 */

// The direction state which can be computed from two opposing keys.
export enum KeyDirectionsEnum {
  NEGATIVE = -1,
  NEUTRAL = 0,
  POSITIVE = 1
}

// For two key presses which oppose each other, determine the direction.
export function calculateDirectionFromOpposingKeys(
  negativeIsActive: boolean,
  positiveIsActive: boolean
): KeyDirectionsEnum {
  if (negativeIsActive === positiveIsActive) return KeyDirectionsEnum.NEUTRAL;

  // If only the negative parameter is active, direction is negative.
  if (negativeIsActive) return KeyDirectionsEnum.NEGATIVE;

  // If only the positive parameter is active, direction is positive.
  return KeyDirectionsEnum.POSITIVE;
}
