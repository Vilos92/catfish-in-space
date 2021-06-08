/**
 * Types.
 */

// The direction state which can be computed from two opposing keys.
export enum KeyDirectionsEnum {
  NEGATIVE = -1,
  NEUTRAL = 0,
  POSITIVE = 1
}

/**
 * Helpers.
 */

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

/**
 * Creates a function which tracks the previous keyIsActive state, to determine
 * whether a key click has been completed.
 * TODO: Use redux to implement this. May need action to run at end of game loop,
 * which disables all clicks.
 */
export function createComputeIsKeyClicked(): (newKeyIsActive: boolean) => boolean {
  let keyIsActive = false;

  return (newKeyIsActive: boolean) => {
    const prevKeyIsActive = keyIsActive;
    keyIsActive = newKeyIsActive;

    // Considered clicked if a key toggles from
    // active to inactive.
    return !newKeyIsActive && prevKeyIsActive;
  };
}
