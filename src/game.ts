// import {Howl} from 'howler';
import * as PIXI from 'pixi.js';

import {createApp, onLoad, onResize, setupKeybinds} from './createApp';
import {setupWindowHooks} from './createApp';
import {KeyCodesEnum, KeyDownAction, keyDownAction, KeyUpAction, keyUpAction} from './store/keyboard/action';
import {KeyboardState} from './store/keyboard/reducer';
import {getKeyboard} from './store/keyboard/selector';
import {
  UpdatePlayerCoordinateAction,
  updatePlayerCoordinateAction,
  UpdatePlayerSpriteAction,
  updatePlayerSpriteAction
} from './store/player/action';
import {getPlayer} from './store/player/selector';
import {GetState, store} from './store/store';
import {UpdateViewportCoordinateAction, updateViewportCoordinateAction} from './store/viewport/action';
import {getViewport} from './store/viewport/selector';
import {CallbackWithArg, Coordinate, makePayloadActionCallback, Renderer} from './type';
import {VERSION} from './util';
import {calculatePositionRelativeToViewport, calculateViewportCoordinate} from './util';

/**
 * Functions.
 */

export function startGame(): void {
  // Hello howler!
  /*
  const soundTest = new Howl({
    src: ['./assets/audio/tests_audio_sound1.mp3'],
    autoplay: true
  });
  console.log('sound test', soundTest);
  */

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

  const updatedPlayerCoordinate = calculateUpdatedPlayerCoordinateFromKeyboard(keyboard, playerCoordinate);

  updatePlayerCoordinate(updatedPlayerCoordinate);

  if (playerSprite) {
    playerSprite.rotation += 0.1;

    const playerPosition = calculatePositionRelativeToViewport(updatedPlayerCoordinate, getViewport(state).coordinate);

    playerSprite.position.set(playerPosition.x, playerPosition.y);
  }

  const viewport = getViewport(state);

  const updatedViewportCoordinate = calculateUpdatedViewportCoordinateFromKeyboard(keyboard, viewport.coordinate);

  updateViewportCoordinate(updatedViewportCoordinate);

  renderer.render(stage);
}

function calculateUpdatedPlayerCoordinateFromKeyboard(
  keyboard: KeyboardState,
  playerCoordinate: Coordinate
): Coordinate {
  return calculateUpdatedCoordinateFromKeyboard(
    keyboard,
    playerCoordinate,
    KeyCodesEnum.KeyA,
    KeyCodesEnum.KeyD,
    KeyCodesEnum.KeyW,
    KeyCodesEnum.KeyS
  );
}

function calculateUpdatedViewportCoordinateFromKeyboard(
  keyboard: KeyboardState,
  viewportCoordinate: Coordinate
): Coordinate {
  return calculateUpdatedCoordinateFromKeyboard(
    keyboard,
    viewportCoordinate,
    KeyCodesEnum.KeyJ,
    KeyCodesEnum.KeyL,
    KeyCodesEnum.KeyI,
    KeyCodesEnum.KeyK
  );
}

function calculateUpdatedCoordinateFromKeyboard(
  keyboard: KeyboardState,
  coordinate: Coordinate,
  keyCodeLeft: KeyCodesEnum,
  keyCodeRight: KeyCodesEnum,
  keyCodeUp: KeyCodesEnum,
  keyCodeDown: KeyCodesEnum
): Coordinate {
  const {keyStateMap} = keyboard;

  const leftIsActive = keyStateMap[keyCodeLeft].isActive;
  const rightIsActive = keyStateMap[keyCodeRight].isActive;
  const upIsActive = keyStateMap[keyCodeUp].isActive;
  const downIsActive = keyStateMap[keyCodeDown].isActive;

  const xDelta = calculateDeltaFromOpposingKeys(leftIsActive, rightIsActive);
  const yDelta = calculateDeltaFromOpposingKeys(upIsActive, downIsActive);

  // TODO: This computation incorrectly gives the player extra velocity at
  // when moving in a diagonal direction.
  return {
    x: coordinate.x + xDelta * 5,
    y: coordinate.y + yDelta * 5
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
