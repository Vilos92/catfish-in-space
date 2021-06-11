import {updateGameElementAction} from 'src/store/gameElement/action';
import {Dispatch} from 'src/store/gameReducer';

import {CollisionTypesEnum, PhysicsElement} from '../type';

export function handlePhysicsCollision(
  dispatch: Dispatch,
  physicsElementA: PhysicsElement,
  physicsElementB: PhysicsElement
): void {
  applyPhysicsCollision(dispatch, physicsElementA.collisionType, physicsElementB);
  applyPhysicsCollision(dispatch, physicsElementB.collisionType, physicsElementA);
}

function applyPhysicsCollision(
  dispatch: Dispatch,
  collisionType: CollisionTypesEnum,
  physicsElement: PhysicsElement
): void {
  // Nothing occurs for an indestructible Element.
  if (!physicsElement.health) return;

  switch (collisionType) {
    case CollisionTypesEnum.PLAYER: {
      console.log(physicsElement.collisionType, physicsElement.health, 'impacted by PLAYER');
      const newPhysicsElement = {...physicsElement, health: physicsElement.health - 50};
      dispatch(updateGameElementAction(newPhysicsElement));
      return;
    }
    case CollisionTypesEnum.PROJECTILE: {
      console.log(physicsElement.collisionType, physicsElement.health, 'impacted by PROJECTILE');
      const newPhysicsElement = {...physicsElement, health: physicsElement.health - 10};
      dispatch(updateGameElementAction(newPhysicsElement));
      return;
    }
    case CollisionTypesEnum.BODY:
    default: {
      console.log(physicsElement.collisionType, physicsElement.health, 'impacted by BODY');
      const newPhysicsElement = {...physicsElement, health: physicsElement.health - 20};
      dispatch(updateGameElementAction(newPhysicsElement));
    }
  }
}
