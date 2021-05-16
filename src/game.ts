// import {Howl} from 'howler';
import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import {createApp, onLoad, onResize, setupKeybinds} from './createApp';
import {setupWindowHooks} from './createApp';
import {KeyDownAction, keyDownAction, KeyUpAction, keyUpAction} from './store/keyboard/action';
import {KeyboardState} from './store/keyboard/reducer';
import {getKeyboard} from './store/keyboard/selector';
import {
  UpdatePlayerCoordinateAction,
  updatePlayerCoordinateAction,
  UpdatePlayerMatterBodyAction,
  updatePlayerMatterBodyAction,
  UpdatePlayerSpriteAction,
  updatePlayerSpriteAction
} from './store/player/action';
import {getPlayer} from './store/player/selector';
import {GetState, store} from './store/store';
import {UpdateViewportCoordinateAction, updateViewportCoordinateAction} from './store/viewport/action';
import {getViewport} from './store/viewport/selector';
import {CallbackWithArg, Coordinate, KeyCodesEnum, makePayloadActionCallback, Renderer} from './type';
import {VERSION} from './util';
import {calculatePositionRelativeToViewport, calculateViewportCoordinate} from './util';

/**
 * Types.
 */

// The direction state which can be computed from two opposing keys.
enum KeyDirectionsEnum {
  NEGATIVE = -1,
  NEUTRAL = 0,
  POSITIVE = 1
}

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

  const updatePlayerMatterBody = makePayloadActionCallback<UpdatePlayerMatterBodyAction, Matter.Body>(
    store.dispatch,
    updatePlayerMatterBodyAction
  );

  const updatePlayerSprite = makePayloadActionCallback<UpdatePlayerSpriteAction, PIXI.AnimatedSprite>(
    store.dispatch,
    updatePlayerSpriteAction
  );

  // Create a Matter engine.
  const engine = Matter.Engine.create();
  // Disable gravity.
  engine.world.gravity.y = 0;

  const runner = Matter.Runner.create();

  // Create a PIXI application.
  const app = createApp(getState);

  const {renderer, stage, ticker, view} = app;

  // Hook for browser window resizes.
  const resize = async (): Promise<void> => onResize(getState, renderer, updateViewportCoordinate);
  resize();

  // Hook for initial loading of assets.
  const onload = async (): Promise<void> =>
    onLoad(getState, engine.world, stage, view, updatePlayerMatterBody, updatePlayerSprite);

  // Attach hooks to window.
  setupWindowHooks(onload, resize);

  // Callback for game loop.
  const onGameLoop = () => gameLoop(getState, renderer, stage, updatePlayerCoordinate, updateViewportCoordinate);

  // Setup key bindings.
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

  // Start the matter runner.
  Matter.Runner.run(runner, engine);

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
  playerLoop(getState, updatePlayerCoordinate);

  spriteLoop(getState);

  // Handle viewport loop last, as it could depend on updated positions of game elements.
  viewportLoop(getState, updateViewportCoordinate);

  renderer.render(stage);
}

function playerLoop(getState: GetState, updatePlayerCoordinate: CallbackWithArg<Coordinate>): void {
  const state = getState();
  const keyboard = getKeyboard(state);
  const player = getPlayer(state);

  const {coordinate: playerCoordinate, matterBody: playerMatterBody} = player.gameElement;

  // Update player coordinate based on matter, rather than a change from keyboard.
  if (playerMatterBody) {
    addForceToPlayerMatterBodyFromKeyboard(keyboard, playerCoordinate, playerMatterBody);

    const updatedPlayerCoordinate = {x: playerMatterBody.position.x, y: playerMatterBody.position.y};
    updatePlayerCoordinate(updatedPlayerCoordinate);
  }
}

function spriteLoop(getState: GetState): void {
  const state = getState();

  const player = getPlayer(state);
  const {coordinate: playerCoordinate, pixiSprite: playerSprite} = player.gameElement;

  if (playerSprite) {
    playerSprite.rotation += 0.1;

    const playerPosition = calculatePositionRelativeToViewport(playerCoordinate, getViewport(state).coordinate);

    playerSprite.position.set(playerPosition.x, playerPosition.y);
  }
}

function viewportLoop(getState: GetState, updateViewportCoordinate: CallbackWithArg<Coordinate>): void {
  const state = getState();
  const keyboard = getKeyboard(state);
  const viewport = getViewport(state);

  const updatedViewportCoordinate = calculateUpdatedViewportCoordinateFromKeyboard(keyboard, viewport.coordinate);

  updateViewportCoordinate(updatedViewportCoordinate);
}

function addForceToPlayerMatterBodyFromKeyboard(
  keyboard: KeyboardState,
  playerCoordinate: Coordinate,
  playerMatterBody: Matter.Body
) {
  const {keyStateMap} = keyboard;

  const leftIsActive = keyStateMap[KeyCodesEnum.KEY_A].isActive;
  const rightIsActive = keyStateMap[KeyCodesEnum.KEY_D].isActive;
  const upIsActive = keyStateMap[KeyCodesEnum.KEY_W].isActive;
  const downIsActive = keyStateMap[KeyCodesEnum.KEY_S].isActive;

  const xDirection = calculateDirectionFromOpposingKeys(leftIsActive, rightIsActive);
  const yDirection = calculateDirectionFromOpposingKeys(upIsActive, downIsActive);

  const thrusterForce = 3000; // Newtons;

  const playerForceVector = {
    x: thrusterForce * xDirection,
    y: thrusterForce * yDirection
  };

  Matter.Body.applyForce(playerMatterBody, playerCoordinate, playerForceVector);
}

function calculateUpdatedViewportCoordinateFromKeyboard(
  keyboard: KeyboardState,
  viewportCoordinate: Coordinate
): Coordinate {
  return calculateUpdatedCoordinateFromKeyboard(
    keyboard,
    viewportCoordinate,
    KeyCodesEnum.KEY_J,
    KeyCodesEnum.KEY_L,
    KeyCodesEnum.KEY_I,
    KeyCodesEnum.KEY_K
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

  const xDirection = calculateDirectionFromOpposingKeys(leftIsActive, rightIsActive);
  const yDirection = calculateDirectionFromOpposingKeys(upIsActive, downIsActive);

  // TODO: This computation incorrectly gives the player extra velocity at
  // when moving in a diagonal direction.
  return {
    x: coordinate.x + xDirection * 5,
    y: coordinate.y + yDirection * 5
  };
}

// For two key presses which oppose each other, determine the delta.
function calculateDirectionFromOpposingKeys(negativeIsActive: boolean, positiveIsActive: boolean): KeyDirectionsEnum {
  if (negativeIsActive === positiveIsActive) return KeyDirectionsEnum.NEUTRAL;

  // If only the negative parameter is active, return -1.
  if (negativeIsActive) return KeyDirectionsEnum.NEGATIVE;

  // If only the positive parameter is active, return 1.
  return KeyDirectionsEnum.POSITIVE;
}
