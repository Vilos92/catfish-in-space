import {Howl} from 'howler';

/**
 * Types.
 */

export enum SoundTypesEnum {
  HARD_COLLISION = 'HARD_COLLISION',
  LASER_BULLET = 'LASER_BULLET',
  LASER_BULLET_IMPACT = 'LASER_BULLET_IMPACT'
}

/**
 * Sound constants.
 */

const hardCollisionSound = new Howl({
  src: ['./assets/audio/hard_collision.wav']
});

const laserBulletSound = new Howl({
  src: ['./assets/audio/laser_bullet.wav']
});

const laserBulletImpactSound = new Howl({
  src: ['./assets/audio/laser_bullet_impact.ogg']
});

const sounds = {
  [SoundTypesEnum.HARD_COLLISION]: hardCollisionSound,
  [SoundTypesEnum.LASER_BULLET]: laserBulletSound,
  [SoundTypesEnum.LASER_BULLET_IMPACT]: laserBulletImpactSound,
};

export function playSound(soundType: SoundTypesEnum) {
  sounds[soundType].play();
}
