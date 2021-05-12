import * as PIXI from 'pixi.js';
import './style.css';
import {calculatePositionRelativeToViewport, calculateViewportCoordinate} from './util';
import {State, store} from './state/store';
import {updateCoordinateAction, UpdateCoordinateAction} from './state/viewport/action';
import {CallbackWithArg, Coordinate, GameSprite, makePayloadActionCallback} from './type';
import {getViewportCoordinate} from './state/viewport/selector';
import {createApp, onResize, onLoad} from './createApp';
import {setupWindowHooks} from './createApp';

/**
 * Types.
 */

export type Renderer = PIXI.Renderer | PIXI.AbstractRenderer;

export interface StageState {
  bird: GameSprite;
}

/**
 * Constants.
 */

declare const VERSION: string;

// Go!

startGame();

/**
 * Main functions.
 */

function startGame() {
  // Initialize the game state.
  const bird: GameSprite = {
    coordinate: {x: 0, y: 0}
  };

  // The coordinates of our Viewport begin negative, as our centered player
  // begins at (0, 0).
  const initialViewportCoordinate = calculateViewportCoordinate(bird, {
    width: window.innerWidth,
    height: window.innerHeight
  });

  const state = store.getState();

  const updateCoordinate = makePayloadActionCallback<UpdateCoordinateAction, Coordinate>(
    store.dispatch,
    updateCoordinateAction
  );

  updateCoordinate(initialViewportCoordinate);

  const stageState: StageState = {bird};

  // Create a PixiJS application.
  const app = createApp();

  const {renderer, stage, ticker, view} = app;

  // Hook for browser window resizes.
  const resize = async (): Promise<void> => onResize(renderer, stageState, state, updateCoordinate);
  resize();

  // Hook for initial loading of assets.
  const onload = async (): Promise<void> => onLoad(stage, view, stageState, state);

  // Attach hooks to window.
  setupWindowHooks(onload, resize);

  // Callback for game loop.
  const onGameLoop = () => gameLoop(renderer, stage, stageState, state, updateCoordinate);

  // Attach and start game loop.
  ticker.add(onGameLoop);
  ticker.start();

  console.log(`Welcome to Catfish in Space v${VERSION}`);
}

/**
 * Primary game loop function, which is responsible for
 * making changes to the current stage.
 */
function gameLoop(
  renderer: Renderer,
  stage: PIXI.Container,
  stageState: StageState,
  state: State,
  updateCoordinate: CallbackWithArg<Coordinate>
) {
  const {bird} = stageState;

  if (stageState.bird && stageState.bird.sprite) {
    stageState.bird.sprite.rotation += 0.1;
  }

  const birdPosition = calculatePositionRelativeToViewport(bird.coordinate, getViewportCoordinate(state.viewport));

  if (bird.sprite) {
    bird.sprite.position.set(birdPosition.x, birdPosition.y);
  }

  const coordinate: Coordinate = {
    x: state.viewport.coordinate.x + 1,
    y: state.viewport.coordinate.y + 1
  };

  updateCoordinate(coordinate);

  renderer.render(stage);
}
