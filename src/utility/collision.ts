import {Howl} from 'howler';
import {updateCollisionTimestampAction} from 'src/store/collision/action';
import {getCollisionTimestamp} from 'src/store/collision/selector';
import {updateGameElementAction} from 'src/store/gameElement/action';
import {Dispatch, GetState} from 'src/store/gameReducer';

import {CollisionTypesEnum, PhysicsElement} from '../type';

/**
 * Constants.
 */

// Only allow four collisions a second between two bodies.
const COLLISION_BUFFER_PERIOD = 250; // 0.25 seconds.

const hardCollisionSound = new Howl({
  src: ['./assets/audio/hard_collision.wav']
});

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

  const now = Date.now();

  const collisionTimestampAToB = getCollisionTimestamp(state, physicsElementA.id, physicsElementB.id);
  const collisionTimestampBToA = getCollisionTimestamp(state, physicsElementB.id, physicsElementA.id);

  const collisionAToBRenewed =
    collisionTimestampAToB === undefined || now > collisionTimestampAToB + COLLISION_BUFFER_PERIOD;

  const collisionBToARenewed =
    collisionTimestampBToA === undefined || now > collisionTimestampBToA + COLLISION_BUFFER_PERIOD;

  if (!collisionAToBRenewed || !collisionBToARenewed) return;

  if (collisionAToBRenewed) applyPhysicsCollision(dispatch, physicsElementA, physicsElementB);
  if (collisionBToARenewed) applyPhysicsCollision(dispatch, physicsElementB, physicsElementA);

  if (
    physicsElementA.collisionType === CollisionTypesEnum.PROJECTILE ||
    physicsElementB.collisionType === CollisionTypesEnum.PROJECTILE
  )
    return;

  hardCollisionSound.play();
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

  const collisionTimestamp = Date.now();
  dispatch(updateCollisionTimestampAction(collisionTimestamp, physicsElementImpacted.id, physicsElementImpacting.id));
}
