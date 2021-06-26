import {updateGameElementsAction} from '../store/gameElement/action';
import {getGameElements} from '../store/gameElement/selector';
import {Dispatch, GetState} from '../store/gameReducer';
import {Coordinate, isPhysicsElement} from '../type';

/**
 * Loop.
 */

// Update game element coordinates to be aligned with their matter positions.
export function positionLoop(getState: GetState, dispatch: Dispatch): void {
  const state = getState();

  const gameElements = getGameElements(state);

  // Update remaining game elements based on their matter positions.
  const updatedGameElements = gameElements.map(gameElement => {
    if (!isPhysicsElement(gameElement)) return gameElement;

    const {matterBody} = gameElement;

    const coordinate: Coordinate = matterBody.position;
    const rotation = matterBody.angle % (2 * Math.PI);

    return {...gameElement, coordinate, rotation};
  });

  dispatch(updateGameElementsAction(updatedGameElements));
}
