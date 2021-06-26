import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import {calculateElementCenterCoordinate, createGameOverTextDisplayElement} from '../element/ui';
import {Dispatch, GetState} from '../store/gameReducer';
import {clearGameOverElementAction, updateGameOverElementAction, updateIsGameOverAction} from '../store/match/action';
import {getMatch} from '../store/match/selector';
import {getMouse} from '../store/mouse/selector';
import {getViewport} from '../store/viewport/selector';
import {MouseButtonCodesEnum} from '../type';
import {computePixiSpriteDimension} from '../utility';
import {restartMatch} from '../utility/world';

/**
 * Loop.
 */

export function uiLoop(getState: GetState, dispatch: Dispatch, world: Matter.World, stage: PIXI.Container): void {
  const state = getState();
  const viewport = getViewport(state);
  const match = getMatch(state);
  const mouse = getMouse(state);

  if (!match.isGameOver) return;

  // Restart match if user presses the primary key after the game has ended.
  if (mouse.buttonStateMap[MouseButtonCodesEnum.MOUSE_BUTTON_PRIMARY].isActive) {
    match.gameOverElement?.pixiSprite.destroy();
    dispatch(clearGameOverElementAction());

    // Clear game over and restart match.
    dispatch(updateIsGameOverAction(false));
    restartMatch(getState, dispatch, world, stage);
    return;
  }

  // Reposition the existing game over text to be in the middle.
  if (match.gameOverElement) {
    const gameOverTextCoordinate = calculateElementCenterCoordinate(
      viewport.dimension,
      computePixiSpriteDimension(match.gameOverElement.pixiSprite)
    );

    match.gameOverElement.pixiSprite.position.set(gameOverTextCoordinate.x, gameOverTextCoordinate.y);
    return;
  }

  // Create a game over text if one does not already exist.
  const gameOverText = createGameOverTextDisplayElement(viewport.dimension);

  stage.addChild(gameOverText.pixiSprite);
  dispatch(updateGameOverElementAction(gameOverText));
}
