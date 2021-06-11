import {updateLastCollisionTimestampAction} from 'src/store/collision/action';
import {getLastCollisionTimestamp} from 'src/store/collision/selector';
import {updateGameElementAction} from 'src/store/gameElement/action';
import {Dispatch, GetState} from 'src/store/gameReducer';

import {CollisionTypesEnum, PhysicsElement} from '../type';

/**
 * Constants.
 */

// Only allow four collisions a second between two bodies.
const COLLISION_BUFFER_PERIOD = 250; // 0.25 seconds.

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

  const lastCollisionTimestampAToB = getLastCollisionTimestamp(state, physicsElementB.id, physicsElementA.id);
  const lastCollisionTimestampBToA = getLastCollisionTimestamp(state, physicsElementA.id, physicsElementB.id);

  if (lastCollisionTimestampAToB === undefined || now > lastCollisionTimestampAToB + COLLISION_BUFFER_PERIOD)
    applyPhysicsCollision(dispatch, physicsElementA, physicsElementB);
  if (lastCollisionTimestampBToA === undefined || now > lastCollisionTimestampBToA + COLLISION_BUFFER_PERIOD)
    applyPhysicsCollision(dispatch, physicsElementB, physicsElementA);
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

  const lastCollisionTimestamp = Date.now();
  dispatch(
    updateLastCollisionTimestampAction(lastCollisionTimestamp, physicsElementImpacted.id, physicsElementImpacting.id)
  );
}
