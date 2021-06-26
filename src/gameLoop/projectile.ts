import Matter from 'matter-js';

import {updateGameElementsAction} from '../store/gameElement/action';
import {getGameElements} from '../store/gameElement/selector';
import {Dispatch, GetState} from '../store/gameReducer';
import {CollisionTypesEnum, isPhysicsElement, PhysicsElement} from '../type';

/**
 * Constants.
 */

// Projectiles should go away after 10 seconds.
const projectileExpiration = 10000;

/**
 * Loop.
 */

// Remove any Game Elements which have expired, such as laser bullets.
export function projectileLoop(getState: GetState, dispatch: Dispatch, world: Matter.World): void {
  const state = getState();

  const gameElements = getGameElements(state);

  // Prune any projectiles which have expired.
  gameElements.filter(isPhysicsElement).forEach(gameElement => {
    if (!checkShouldPruneProjectile(gameElement)) return;

    gameElement.pixiSprite.destroy();

    Matter.Composite.remove(world, gameElement.matterBody);
  });

  // Compute the remaining array of game elements.
  const updatedGameElements = gameElements.filter(
    gameElement => !isPhysicsElement(gameElement) || !checkShouldPruneProjectile(gameElement)
  );

  dispatch(updateGameElementsAction(updatedGameElements));
}

/**
 * Helpers.
 */

function checkShouldPruneProjectile(physicsElement: PhysicsElement): boolean {
  if (physicsElement.collisionType !== CollisionTypesEnum.PROJECTILE) return false;

  return Date.now() - physicsElement.timestamp > projectileExpiration;
}
