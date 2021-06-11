import {CollisionTypesEnum, PhysicsElement} from '../type';

export function handlePhysicsCollision(physicsElementA: PhysicsElement, physicsElementB: PhysicsElement): void {
  applyPhysicsCollision(physicsElementA.collisionType, physicsElementB);
  applyPhysicsCollision(physicsElementB.collisionType, physicsElementA);
}

function applyPhysicsCollision(collisionType: CollisionTypesEnum, physicsElement: PhysicsElement): void {
  switch (collisionType) {
    case CollisionTypesEnum.PLAYER:
      console.log(physicsElement.collisionType, 'impacted by PLAYER');
      break;
    case CollisionTypesEnum.PROJECTILE:
      console.log(physicsElement.collisionType, 'impacted by PROJECTILE');
      break;
    case CollisionTypesEnum.BODY:
    default:
      console.log(physicsElement.collisionType, 'impacted by BODY');
  }
}
