import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import {createApp, onLoad, onResize, setupCollisions, setupKeybinds} from './createApp';
import {setupWindowHooks} from './createApp';
import {gameLoop} from './gameLoop/game';
import {store} from './store/gameReducer';
import {updateViewportCoordinateAction} from './store/viewport/action';
import {calculateViewportCoordinate} from './utility/viewport';

/**
 * Functions.
 */

export function startGame(): void {
  const getState = store.getState;
  // Initialize the game state.
  const initialPlayerCoordinate = {x: 0, y: 0};

  // The coordinates of our Viewport begin negative, as our centered player
  // begins at (0, 0).
  const initialViewportCoordinate = calculateViewportCoordinate(initialPlayerCoordinate, {
    width: window.innerWidth,
    height: window.innerHeight
  });

  store.dispatch(updateViewportCoordinateAction(initialViewportCoordinate));

  // Create a Matter engine.
  const engine = Matter.Engine.create();
  // Disable gravity.
  engine.gravity.y = 0;

  // Attach hooks to Matter.
  setupCollisions(getState, store.dispatch, engine);

  const runner = Matter.Runner.create();

  // Create a PIXI application.
  const app = createApp(getState);

  const {renderer, stage, ticker, view} = app;

  const backgroundStage = new PIXI.Container();
  stage.addChild(backgroundStage);

  const foregroundStage = new PIXI.Container();
  stage.addChild(foregroundStage);

  // Hook for browser window resizes.
  const resize = async (): Promise<void> => onResize(getState, store.dispatch, renderer);
  resize();

  // Hook for initial loading of assets.
  const onload = async (): Promise<void> => onLoad(getState, store.dispatch, engine.world, foregroundStage, view);

  // Attach hooks to window.
  setupWindowHooks(onload, resize);

  // Callback for game loop.
  const onGameLoop = () => gameLoop(getState, store.dispatch, engine.world, renderer, foregroundStage, backgroundStage);

  // Setup key bindings.
  setupKeybinds(store.dispatch, view);

  // Start the matter runner.
  Matter.Runner.run(runner, engine);

  // Attach and start game loop.
  ticker.add(onGameLoop);
  ticker.start();
}
