import {Howl} from 'howler';
import {updateCollisionTimestampAction} from 'src/store/collision/action';
import {getCollisionTimestamp} from 'src/store/collision/selector';
import {updateGameElementAction} from 'src/store/gameElement/action';
import {Dispatch, GetState} from 'src/store/gameReducer';
import {getViewport} from 'src/store/viewport/selector';

import {CollisionTypesEnum, Coordinate, Dimension, PhysicsElement} from '../type';
import {createSound, soundAtCoordinate, SoundTypesEnum} from './audio';

/**
 * Constants.
 */

// Only allow four collisions a second between two bodies.
const collisionBufferPeriod = 250; // 0.25 seconds.

// Audio.
const laserBulletImpactSound = createSound(SoundTypesEnum.LASER_BULLET_IMPACT);
const hardCollisionSound = createSound(SoundTypesEnum.HARD_COLLISION);

/**
 * Collision handling.
 */

export function handlePhysicsCollision(
  getState: GetState,
  dispatch: Dispatch,
  physicsElementA: PhysicsElement,
  physicsElementB: PhysicsElement
): void {
  const state = getState();
  const viewport = getViewport(state);

  const now = Date.now();

  // We only need to track one timestamp for any pair of elements, but we must use the same
  // order each time for inserting and deletion.
  const idTuple = [physicsElementA.id, physicsElementB.id].sort();

  const collisionTimestamp = getCollisionTimestamp(state, idTuple[0], idTuple[1]);

  const collisionTimestampRenewed =
    collisionTimestamp === undefined || now > collisionTimestamp + collisionBufferPeriod;

  if (!collisionTimestampRenewed) return;

  dispatch(updateCollisionTimestampAction(now, idTuple[0], idTuple[1]));

  applyPhysicsCollision(dispatch, physicsElementA, physicsElementB);
  applyPhysicsCollision(dispatch, physicsElementB, physicsElementA);

  handleCollisionSound(
    viewport.coordinate,
    viewport.dimension,
    physicsElementA.coordinate,
    physicsElementA.collisionType,
    physicsElementB.collisionType
  );
}

function applyPhysicsCollision(
  dispatch: Dispatch,
  physicsElementImpacting: PhysicsElement,
  physicsElementImpacted: PhysicsElement
): void {
  // Nothing occurs for an indestructible Element.
  if (!physicsElementImpacted.health) return;

  switch (physicsElementImpacting.collisionType) {
    case CollisionTypesEnum.PLAYER: {
      const newPhysicsElement = {...physicsElementImpacted, health: physicsElementImpacted.health - 50};
      dispatch(updateGameElementAction(newPhysicsElement));
      break;
    }
    case CollisionTypesEnum.PROJECTILE: {
      const newPhysicsElement = {...physicsElementImpacted, health: physicsElementImpacted.health - 10};
      dispatch(updateGameElementAction(newPhysicsElement));
      break;
    }
    case CollisionTypesEnum.BODY:
    default: {
      const newPhysicsElement = {...physicsElementImpacted, health: physicsElementImpacted.health - 20};
      dispatch(updateGameElementAction(newPhysicsElement));
    }
  }
}

function handleCollisionSound(
  viewportCoordinate: Coordinate,
  viewportDimension: Dimension,
  collisionCoordinate: Coordinate,
  collisionTypeA: CollisionTypesEnum,
  collisionTypeB: CollisionTypesEnum
) {
  const sound = computeCollisionSound(collisionTypeA, collisionTypeB);

  const spatialSound = soundAtCoordinate(sound, collisionCoordinate, viewportCoordinate, viewportDimension);
  spatialSound.play();
}

function computeCollisionSound(collisionTypeA: CollisionTypesEnum, collisionTypeB: CollisionTypesEnum): Howl {
  if (collisionTypeA === CollisionTypesEnum.PROJECTILE || collisionTypeB === CollisionTypesEnum.PROJECTILE)
    return laserBulletImpactSound;

  return hardCollisionSound;
}
