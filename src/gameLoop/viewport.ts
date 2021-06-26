import {Dispatch, GetState} from '../store/gameReducer';
import {getKeyboard} from '../store/keyboard/selector';
import {updatePlayerIsViewportLockedAction} from '../store/player/action';
import {getPlayer} from '../store/player/selector';
import {updateViewportCoordinateAction} from '../store/viewport/action';
import {getViewport} from '../store/viewport/selector';
import {Coordinate} from '../type';
import {createComputeIsKeyClicked} from '../utility/keyboard';
import {calculateUpdatedViewportCoordinateFromKeyboard, calculateViewportCoordinate} from '../utility/viewport';

/**
 * Loop.
 */

export function viewportLoop(getState: GetState, dispatch: Dispatch): void {
  const state = getState();
  const keyboard = getKeyboard(state);
  const player = getPlayer(state);
  const viewport = getViewport(state);

  if (computeIsViewportKeyClicked(keyboard.keyStateMap.KeyV.isActive)) {
    dispatch(updatePlayerIsViewportLockedAction(!player.isViewportLocked));
  }

  const updatedViewportCoordinate: Coordinate =
    player.isViewportLocked && player.gameElement
      ? calculateViewportCoordinate(player.gameElement.coordinate, viewport.dimension)
      : calculateUpdatedViewportCoordinateFromKeyboard(keyboard, viewport.coordinate);

  dispatch(updateViewportCoordinateAction(updatedViewportCoordinate));
}

/**
 * Helpers.
 */

const computeIsViewportKeyClicked = createComputeIsKeyClicked();
