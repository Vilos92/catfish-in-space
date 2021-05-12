import * as PIXI from 'pixi.js';
import {VERSION} from './util';
import {calculatePositionRelativeToViewport, calculateViewportCoordinate} from './util';
import {store, State} from './state/store';
import {updateViewportCoordinateAction, UpdateViewportCoordinateAction} from './state/viewport/action';
import {CallbackWithArg, Coordinate, GameSprite, makePayloadActionCallback, Renderer} from './type';
import {createApp, onResize, onLoad} from './createApp';
import {setupWindowHooks} from './createApp';
import {getViewportCoordinate} from './state/viewport/selector';

/**
 * Types.
 */

export interface StageState {
  bird: GameSprite;
}

/**
 * Functions.
 */

export function startGame(): void {
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

  const updateViewportCoordinate = makePayloadActionCallback<UpdateViewportCoordinateAction, Coordinate>(
    store.dispatch,
    updateViewportCoordinateAction
  );

  updateViewportCoordinate(initialViewportCoordinate);

  const stageState: StageState = {bird};

  // Create a PixiJS application.
  const app = createApp();

  const {renderer, stage, ticker, view} = app;

  // Hook for browser window resizes.
  const resize = async (): Promise<void> => onResize(renderer, stageState, state, updateViewportCoordinate);
  resize();

  // Hook for initial loading of assets.
  const onload = async (): Promise<void> => onLoad(stage, view, stageState, state);

  // Attach hooks to window.
  setupWindowHooks(onload, resize);

  // Callback for game loop.
  const onGameLoop = () => gameLoop(renderer, stage, stageState, state, updateViewportCoordinate);

  // Attach and start game loop.
  ticker.add(onGameLoop);
  ticker.start();

  console.log(`Welcome to Catfish in Space v${VERSION}`);
}

/**
 * Primary game loop function, which is responsible for
 * making changes to the current stage.
 */
export function gameLoop(
  renderer: Renderer,
  stage: PIXI.Container,
  stageState: StageState,
  state: State,
  updateViewportCoordinate: CallbackWithArg<Coordinate>
): void {
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

  updateViewportCoordinate(coordinate);

  renderer.render(stage);
}
