import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import {createPlayerGameElement} from '../element/player';
import {createRectangleGameElement} from '../element/rectangle';
import {updateGameElementsAction} from '../store/gameElement/action';
import {getGameElements} from '../store/gameElement/selector';
import {Dispatch, GetState} from '../store/gameReducer';
import {updatePlayerGameElementAction} from '../store/player/action';
import {getViewport} from '../store/viewport/selector';
import {isPhysicsElement} from '../type';
import {addGameElement} from '../utility';

/**
 * Clear the current game state, and begin a new match.
 */
export function restartMatch(
  getState: GetState,
  dispatch: Dispatch,
  world: Matter.World,
  foregroundStage: PIXI.Container
): void {
  clearGameState(getState, dispatch, world, foregroundStage);
  setupWorld(getState, dispatch, world, foregroundStage);
}

/**
 * Clear all PIXI and Matter resources for the ongoing match.
 */
function clearGameState(getState: GetState, dispatch: Dispatch, world: Matter.World, foregroundStage: PIXI.Container) {
  const state = getState();
  const gameElements = getGameElements(state);

  // Remove sprites from foreground.
  foregroundStage.removeChildren();

  // Remove Physics Bodies.
  gameElements.forEach(gameElement => {
    if (!isPhysicsElement(gameElement)) return;

    Matter.World.remove(world, gameElement.matterBody);
  });

  // Clear the Game Elements from the reducer.
  dispatch(updateGameElementsAction([]));
}

/**
 * Setup the stage of the game, by adding initial elements.
 */
export function setupWorld(
  getState: GetState,
  dispatch: Dispatch,
  world: Matter.World,
  foregroundStage: PIXI.Container
): void {
  const state = getState();
  const viewport = getViewport(state);

  const player = createPlayerGameElement(viewport.coordinate);
  dispatch(updatePlayerGameElementAction(player));
  addGameElement(dispatch, world, foregroundStage, player);

  const testRectangle1 = createRectangleGameElement(viewport.coordinate, {x: 600, y: -100});
  const testRectangle2 = createRectangleGameElement(viewport.coordinate, {x: -600, y: 100});
  const testRectangle3 = createRectangleGameElement(viewport.coordinate, {x: -1000, y: 100});
  addGameElement(dispatch, world, foregroundStage, testRectangle1);
  addGameElement(dispatch, world, foregroundStage, testRectangle2);
  addGameElement(dispatch, world, foregroundStage, testRectangle3);
}
