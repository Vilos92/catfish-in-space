import Matter from 'matter-js';

import {removeGameElementByIdAction} from '../store/collision/action';
import {updateGameElementsAction} from '../store/gameElement/action';
import {getGameElements} from '../store/gameElement/selector';
import {Dispatch, GetState} from '../store/gameReducer';
import {isPhysicsElement} from '../type';

/**
 * Loop.
 */

// Destroy Game Elements which have 0 or lower health, and remove from state.
export function healthLoop(getState: GetState, dispatch: Dispatch, world: Matter.World): void {
  const state = getState();

  const gameElements = getGameElements(state);

  gameElements.forEach(gameElement => {
    if (gameElement.health === undefined || gameElement.health > 0) return;

    gameElement.pixiSprite.destroy();

    if (isPhysicsElement(gameElement)) Matter.Composite.remove(world, gameElement.matterBody);

    dispatch(removeGameElementByIdAction(gameElement.id));
  });

  const updatedGameElements = gameElements.filter(
    gameElement => gameElement.health === undefined || gameElement.health > 0
  );

  dispatch(updateGameElementsAction(updatedGameElements));
}
