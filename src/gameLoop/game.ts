import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import {Dispatch, GetState} from '../store/gameReducer';
import {Renderer} from '../type';
import {backgroundStageLoop} from './backgroundStage';
import {debugLoop} from './debug';
import {healthLoop} from './health';
import {playerLoop} from './player';
import {positionLoop} from './position';
import {projectileLoop} from './projectile';
import {spriteLoop} from './sprite';
import {uiLoop} from './ui';
import {viewportLoop} from './viewport';

/**
 * Primary game loop function, which is responsible for
 * making changes to the current stage.
 *
 * When adding additional loops to this, considerations should be made for:
 * - The potential side-effects of a new loop on existing loops. Ordering may matter.
 * - Performance impact of the entire game. All of these loops are called within a single animation frame.
 */
export function gameLoop(
  getState: GetState,
  dispatch: Dispatch,
  world: Matter.World,
  renderer: Renderer,
  stage: PIXI.Container,
  backgroundStage: PIXI.Container
): void {
  // Optionally draw debug wire frames from the Matter world.
  debugLoop(getState, world, stage);

  // Handle player loop first, to account for keyboard inputs to apply changes to the matter body.
  playerLoop(getState, dispatch, world, renderer, stage);

  // Handle prune loop, to remove any elements which have expired timers.
  projectileLoop(getState, dispatch, world);

  // Handle health next, to destroy game elements which have 0 or lower health.
  healthLoop(getState, dispatch, world);

  // Handle position loop, to account for changes in matter position and rotation.
  positionLoop(getState, dispatch);

  // Handle sprite loop afterwards, to align canvas with the game world's coordinates (relative to the viewport).
  spriteLoop(getState);

  // Handle viewport loop last, as it can depend on updated positions of game elements.
  viewportLoop(getState, dispatch);

  // Draw the star field.
  backgroundStageLoop(getState, dispatch, backgroundStage);

  // Draw any UI elements on top.
  uiLoop(getState, dispatch, world, stage);

  renderer.render(stage);
}
