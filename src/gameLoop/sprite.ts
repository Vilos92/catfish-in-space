import {getGameElements} from '../store/gameElement/selector';
import {GetState} from '../store/gameReducer';
import {getViewport} from '../store/viewport/selector';
import {calculatePositionRelativeToViewport} from '../utility/viewport';

/**
 * Loop.
 */

export function spriteLoop(getState: GetState): void {
  const state = getState();

  const viewport = getViewport(state);
  const {coordinate: viewportCoordinate} = viewport;

  const gameElements = getGameElements(state);
  gameElements.forEach(gameElement => {
    const gameElementPosition = calculatePositionRelativeToViewport(gameElement.coordinate, viewportCoordinate);

    gameElement.pixiSprite.position.set(gameElementPosition.x, gameElementPosition.y);
    gameElement.pixiSprite.rotation = gameElement.rotation;
  });
}
