import {Howl, HowlOptions} from 'howler';

/**
 * Types.
 */

export enum SoundTypesEnum {
  HARD_COLLISION = 'HARD_COLLISION',
  ROCKET_THRUST = 'ROCKET_THRUST',
  LASER_BULLET = 'LASER_BULLET',
  LASER_BULLET_IMPACT = 'LASER_BULLET_IMPACT'
}

const SoundTypeSources = {
  [SoundTypesEnum.HARD_COLLISION]: './assets/audio/hard_collision.wav',
  [SoundTypesEnum.ROCKET_THRUST]: './assets/audio/rocket-thrust.wav',
  [SoundTypesEnum.LASER_BULLET]: './assets/audio/laser_bullet.wav',
  [SoundTypesEnum.LASER_BULLET_IMPACT]: './assets/audio/laser_bullet_impact.ogg'
};

/**
 * Sound constants.
 */

export function playSound(soundType: SoundTypesEnum): Howl {
  const sound = new Howl({
    src: SoundTypeSources[soundType]
  });

  sound.play();
  return sound;
}

export function playSoundAtRandom(soundType: SoundTypesEnum, howlOptions: HowlOptions): Howl {
  const sound = new Howl({
    src: SoundTypeSources[soundType],
    ...howlOptions
  });

  sound.seek(Math.floor(Math.random() * sound.duration()));
  sound.play();
  return sound;
}
