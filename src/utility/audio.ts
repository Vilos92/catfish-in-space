import {Howl, HowlOptions} from 'howler';
import {Coordinate, Dimension} from 'src/type';

import {computeMagnitude} from '.';
import {calculatePositionRelativeToViewportCenter} from './viewport';

/**
 * Types.
 */

export enum SoundTypesEnum {
  HARD_COLLISION = 'HARD_COLLISION',
  ROCKET_THRUST = 'ROCKET_THRUST',
  LASER_BULLET = 'LASER_BULLET',
  LASER_BULLET_IMPACT = 'LASER_BULLET_IMPACT'
}

/**
 * Sound constants.
 */

const SoundTypeSources = {
  [SoundTypesEnum.HARD_COLLISION]: './assets/audio/hard_collision.wav',
  [SoundTypesEnum.ROCKET_THRUST]: './assets/audio/rocket-thrust.wav',
  [SoundTypesEnum.LASER_BULLET]: './assets/audio/laser_bullet.wav',
  [SoundTypesEnum.LASER_BULLET_IMPACT]: './assets/audio/laser_bullet_impact.ogg'
};

/**
 * Spatial audio ratio is the ratio between current coordinate
 * and screen dimension. For example: Xaudio = Xel / Dwidth
 */

// The spatial audio ratio where audio should be muted.
const spatialSilenceLimit = 10;

/**
 * Audio utilities.
 */

export function createSound(soundType: SoundTypesEnum, howlOptions: HowlOptions = {}): Howl {
  return new Howl({
    src: SoundTypeSources[soundType],
    ...howlOptions
  });
}

export function playSound(soundType: SoundTypesEnum): Howl {
  const sound = createSound(soundType);
  sound.play();

  return sound;
}

export function soundAtCoordinate(
  sound: Howl,
  coordinate: Coordinate,
  viewportCoordinate: Coordinate,
  viewportDimension: Dimension
): Howl {
  const spatialCoordinate = calculateSpatialCoordinate(coordinate, viewportCoordinate, viewportDimension);

  const spatialDistance = computeMagnitude(spatialCoordinate);

  const shouldMute = spatialDistance > spatialSilenceLimit;
  sound.mute(shouldMute);

  return sound;
}

/**
 * For sounds which are played for longer durations but intermittently, find a random
 * location in the sound to start from.
 * NOTE: Does not loop by default, this can be provided through howlOptions.
 */
export function soundAtRandom(sound: Howl): Howl {
  sound.seek(Math.floor(Math.random() * sound.duration()));
  sound.play();

  return sound;
}

/**
 * Helpers.
 */

function calculateSpatialCoordinate(
  coordinate: Coordinate,
  viewportCoordinate: Coordinate,
  viewportDimension: Dimension
): Coordinate {
  const relativePosition = calculatePositionRelativeToViewportCenter(coordinate, viewportCoordinate, viewportDimension);

  return {
    x: relativePosition.x / viewportDimension.width,
    y: relativePosition.y / viewportDimension.height
  };
}
