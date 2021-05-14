import * as PIXI from 'pixi.js';

import {createApp, onLoad, onResize, setupKeybinds} from './createApp';
import {setupWindowHooks} from './createApp';
import {KeyCodesEnum, KeyDownAction, keyDownAction, KeyUpAction, keyUpAction} from './state/keyboard/action';
import {KeyboardState} from './state/keyboard/reducer';
import {getKeyboard} from './state/keyboard/selector';
import {
  UpdatePlayerCoordinateAction,
  updatePlayerCoordinateAction,
  UpdatePlayerSpriteAction,
  updatePlayerSpriteAction
} from './state/player/action';
import {getPlayer} from './state/player/selector';
import {GetState, store} from './state/store';
import {UpdateViewportCoordinateAction, updateViewportCoordinateAction} from './state/viewport/action';
import {getViewport} from './state/viewport/selector';
import {CallbackWithArg, Coordinate, makePayloadActionCallback, Renderer} from './type';
import {VERSION} from './util';
import {calculatePositionRelativeToViewport, calculateViewportCoordinate} from './util';

/**
 * Functions.
 */

export function startGame(): void {
  const getState = store.getState;

  // Initialize the game state.
  const coordinate = {x: 0, y: 0};

  // The coordinates of our Viewport begin negative, as our centered player
  // begins at (0, 0).
  const initialViewportCoordinate = calculateViewportCoordinate(coordinate, {
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Setup actions from dispatch.
  const updateViewportCoordinate = makePayloadActionCallback<UpdateViewportCoordinateAction, Coordinate>(
    store.dispatch,
    updateViewportCoordinateAction
  );

  updateViewportCoordinate(initialViewportCoordinate);

  const updatePlayerCoordinate = makePayloadActionCallback<UpdatePlayerCoordinateAction, Coordinate>(
    store.dispatch,
    updatePlayerCoordinateAction
  );

  const updatePlayerSprite = makePayloadActionCallback<UpdatePlayerSpriteAction, PIXI.AnimatedSprite>(
    store.dispatch,
    updatePlayerSpriteAction
  );

  // Create a PixiJS application.
  const app = createApp(getState);

  const {renderer, stage, ticker, view} = app;

  // Hook for browser window resizes.
  const resize = async (): Promise<void> => onResize(getState, renderer, updateViewportCoordinate);
  resize();

  // Hook for initial loading of assets.
  const onload = async (): Promise<void> => onLoad(getState, stage, view, updatePlayerSprite);

  // Attach hooks to window.
  setupWindowHooks(onload, resize);

  // Callback for game loop.
  const onGameLoop = () => gameLoop(getState, renderer, stage, updatePlayerCoordinate, updateViewportCoordinate);

  // Setup key binds.
  // Create a keyboard reducer which receives the keyboard code, and a up/down event.
  // Reducer itself can determine if key is pressed/depressed.
  // Game loop check check keyboard state to take action, rather than event moving the character.
  // This keeps everything functional despite the event nature of the keyboard.

  const keyDown = makePayloadActionCallback<KeyDownAction, KeyCodesEnum>(store.dispatch, keyDownAction);
  const handleKeydown = (event: KeyboardEvent): void => {
    const keyCode: unknown = event.code;
    keyDown(keyCode as KeyCodesEnum);
  };

  const keyUp = makePayloadActionCallback<KeyUpAction, KeyCodesEnum>(store.dispatch, keyUpAction);
  const handleKeyup = (event: KeyboardEvent): void => {
    const keyCode: unknown = event.code;
    keyUp(keyCode as KeyCodesEnum);
  };

  setupKeybinds(handleKeydown, handleKeyup);

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
  getState: GetState,
  renderer: Renderer,
  stage: PIXI.Container,
  updatePlayerCoordinate: CallbackWithArg<Coordinate>,
  updateViewportCoordinate: CallbackWithArg<Coordinate>
): void {
  const state = getState();

  const keyboard = getKeyboard(state);

  const player = getPlayer(state);
  const {coordinate: playerCoordinate, sprite: playerSprite} = player.gameElement;

  const updatedPlayerCoordinate = calculateUpdatedCoordinateFromKeyboard(keyboard, playerCoordinate);

  updatePlayerCoordinate(updatedPlayerCoordinate);

  if (playerSprite) {
    playerSprite.rotation += 0.1;

    const playerPosition = calculatePositionRelativeToViewport(updatedPlayerCoordinate, getViewport(state).coordinate);

    playerSprite.position.set(playerPosition.x, playerPosition.y);
  }

  const updatedViewportCoordinate: Coordinate = {
    x: state.viewport.coordinate.x + 1,
    y: state.viewport.coordinate.y + 1
  };

  updateViewportCoordinate(updatedViewportCoordinate);

  renderer.render(stage);
}

function calculateUpdatedCoordinateFromKeyboard(keyboard: KeyboardState, playerCoordinate: Coordinate): Coordinate {
  const {keyStateMap} = keyboard;

  const aIsActive = keyStateMap[KeyCodesEnum.KeyA].isActive;
  const dIsActive = keyStateMap[KeyCodesEnum.KeyD].isActive;
  const wIsActive = keyStateMap[KeyCodesEnum.KeyW].isActive;
  const sIsActive = keyStateMap[KeyCodesEnum.KeyS].isActive;

  const xDelta = calculateDeltaFromOpposingKeys(aIsActive, dIsActive);
  const yDelta = calculateDeltaFromOpposingKeys(wIsActive, sIsActive);

  return {
    x: playerCoordinate.x + xDelta * 5,
    y: playerCoordinate.y + yDelta * 5
  };
}

// For two key presses which oppose each other, determine the delta.
function calculateDeltaFromOpposingKeys(leftIsActive: boolean, rightIsActive: boolean): number {
  if (leftIsActive === rightIsActive) return 0;

  // If only the left parameter is active, return -1.
  if (leftIsActive) return -1;

  // If only the right parameter is active, return 1.
  return 1;
}
