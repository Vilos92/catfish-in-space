import * as PIXI from 'pixi.js';

import {updateStarFieldAAction, updateStarFieldBAction} from '../store/backgroundStage/action';
import {getStarFieldA, getStarFieldB} from '../store/backgroundStage/selector';
import {Dispatch, GetState} from '../store/gameReducer';
import {getViewport} from '../store/viewport/selector';
import {BACKGROUND_PARALLAX_SCALE_A, BACKGROUND_PARALLAX_SCALE_B, updateStarField} from '../utility/star';

/**
 * Loop.
 */

export function backgroundStageLoop(getState: GetState, dispatch: Dispatch, backgroundStage: PIXI.Container): void {
  const state = getState();
  const viewport = getViewport(state);
  const starFieldA = getStarFieldA(state);
  const starFieldB = getStarFieldB(state);

  const updatedStarFieldA = updateStarField(
    backgroundStage,
    viewport.coordinate,
    viewport.dimension,
    starFieldA,
    BACKGROUND_PARALLAX_SCALE_A
  );

  const updatedStarFieldB = updateStarField(
    backgroundStage,
    viewport.coordinate,
    viewport.dimension,
    starFieldB,
    BACKGROUND_PARALLAX_SCALE_B
  );

  dispatch(updateStarFieldAAction(updatedStarFieldA));
  dispatch(updateStarFieldBAction(updatedStarFieldB));
}
