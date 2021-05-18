// import {Howl} from 'howler';
import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import {createApp, onLoad, onResize, setupKeybinds} from './createApp';
import {setupWindowHooks} from './createApp';
import {KeyboardState} from './store/keyboard/reducer';
import {getKeyboard} from './store/keyboard/selector';
import {updatePlayerCoordinateAction, updatePlayerRotationAction} from './store/player/action';
import {getPlayer} from './store/player/selector';
import {Dispatch, GetState, store} from './store/store';
import {updateViewportCoordinateAction} from './store/viewport/action';
import {getViewport} from './store/viewport/selector';
import {Coordinate, KeyCodesEnum, Renderer} from './type';
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
  engine.world.gravity.y = 0;

  const runner = Matter.Runner.create();

  // Create a PIXI application.
  const app = createApp(getState);

  const {renderer, stage, ticker, view} = app;

  // Hook for browser window resizes.
  const resize = async (): Promise<void> => onResize(getState, store.dispatch, renderer);
  resize();

  // Hook for initial loading of assets.
  const onload = async (): Promise<void> => onLoad(getState, store.dispatch, engine.world, stage, view);

  // Attach hooks to window.
  setupWindowHooks(onload, resize);

  // Callback for game loop.
  const onGameLoop = () => gameLoop(getState, store.dispatch, renderer, stage);

  // Setup key bindings.
  setupKeybinds(store.dispatch);

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
export function gameLoop(getState: GetState, dispatch: Dispatch, renderer: Renderer, stage: PIXI.Container): void {
  // 1. Handle player loop first, to account for keyboard inputs and changes in matter position.
  playerLoop(getState, dispatch);

  // 2. Handle sprite loop after player loop, to account for changes in matter position.
  spriteLoop(getState);

  // 3. Handle viewport loop last, as it can depend on updated positions of game elements.
  viewportLoop(getState, dispatch);

  renderer.render(stage);
}

// Set forces on player matter from keyboard inputs, and update player coordinate
// to be aligned with the matter position.
function playerLoop(getState: GetState, dispatch: Dispatch): void {
  const state = getState();
  const keyboard = getKeyboard(state);
  const player = getPlayer(state);

  const {matterBody: playerMatterBody} = player.gameElement;

  if (!playerMatterBody) return;

  // Apply forces from keyboard presses, before updating state with values from matter.
  addForceToPlayerMatterBodyFromKeyboard(keyboard, playerMatterBody);

  const updatedPlayerCoordinate = {x: playerMatterBody.position.x, y: playerMatterBody.position.y};
  dispatch(updatePlayerCoordinateAction(updatedPlayerCoordinate));

  dispatch(updatePlayerRotationAction(playerMatterBody.angle));
}

function spriteLoop(getState: GetState): void {
  const state = getState();

  const player = getPlayer(state);
  const {coordinate: playerCoordinate, rotation: playerRotation, pixiSprite: playerSprite} = player.gameElement;

  if (!playerSprite) return;

  const playerPosition = calculatePositionRelativeToViewport(playerCoordinate, getViewport(state).coordinate);
  playerSprite.position.set(playerPosition.x, playerPosition.y);

  playerSprite.rotation = playerRotation;
}

function viewportLoop(getState: GetState, dispatch: Dispatch): void {
  const state = getState();
  const keyboard = getKeyboard(state);
  const viewport = getViewport(state);

  const updatedViewportCoordinate = calculateUpdatedViewportCoordinateFromKeyboard(keyboard, viewport.coordinate);

  dispatch(updateViewportCoordinateAction(updatedViewportCoordinate));
}

function addForceToPlayerMatterBodyFromKeyboard(keyboard: KeyboardState, playerMatterBody: Matter.Body) {
  const {keyStateMap} = keyboard;

  const leftIsActive = keyStateMap[KeyCodesEnum.KEY_A].isActive;
  const rightIsActive = keyStateMap[KeyCodesEnum.KEY_D].isActive;
  const upIsActive = keyStateMap[KeyCodesEnum.KEY_W].isActive;
  const downIsActive = keyStateMap[KeyCodesEnum.KEY_S].isActive;

  const sideDirection = calculateDirectionFromOpposingKeys(leftIsActive, rightIsActive);
  const straightDirection = calculateDirectionFromOpposingKeys(downIsActive, upIsActive);

  const straightThrusterForce = 1000; // Newtons;
  const sideThrusterForce = 10; // Newtons;

  // Force should be based on the current direction of the ship.
  const xStraightForce = Math.cos(playerMatterBody.angle) * straightThrusterForce * straightDirection;
  const yStraightForce = Math.sin(playerMatterBody.angle) * straightThrusterForce * straightDirection;

  const playerStraightForceVector: Matter.Vector = {
    x: xStraightForce,
    y: yStraightForce
  };

  Matter.Body.applyForce(playerMatterBody, playerMatterBody.position, playerStraightForceVector);

  // TODO: Compute this based on the width of the ship.
  const behindPlayerCoordinate = {
    x: playerMatterBody.position.x - Math.cos(playerMatterBody.angle) * 5,
    y: playerMatterBody.position.y - Math.sin(playerMatterBody.angle) * 5
  };

  // Force should be based on the current direction of the ship.
  const xSideForce = -Math.cos(playerMatterBody.angle + Math.PI / 2) * sideThrusterForce * sideDirection;
  const ySideForce = -Math.sin(playerMatterBody.angle + Math.PI / 2) * sideThrusterForce * sideDirection;

  const playerSideForceVector: Matter.Vector = {
    x: xSideForce,
    y: ySideForce
  };

  Matter.Body.applyForce(playerMatterBody, behindPlayerCoordinate, playerSideForceVector);
}

function calculateUpdatedViewportCoordinateFromKeyboard(
  keyboard: KeyboardState,
  viewportCoordinate: Coordinate
): Coordinate {
  const {keyStateMap} = keyboard;

  const leftIsActive = keyStateMap[KeyCodesEnum.KEY_J].isActive;
  const rightIsActive = keyStateMap[KeyCodesEnum.KEY_L].isActive;
  const upIsActive = keyStateMap[KeyCodesEnum.KEY_I].isActive;
  const downIsActive = keyStateMap[KeyCodesEnum.KEY_K].isActive;

  const xDirection = calculateDirectionFromOpposingKeys(leftIsActive, rightIsActive);
  const yDirection = calculateDirectionFromOpposingKeys(upIsActive, downIsActive);

  // TODO: This computation incorrectly gives the player extra velocity at
  // when moving in a diagonal direction.

  return {
    x: viewportCoordinate.x + xDirection * 5,
    y: viewportCoordinate.y + yDirection * 5
  };
}

// For two key presses which oppose each other, determine the direction.
function calculateDirectionFromOpposingKeys(negativeIsActive: boolean, positiveIsActive: boolean): KeyDirectionsEnum {
  if (negativeIsActive === positiveIsActive) return KeyDirectionsEnum.NEUTRAL;

  // If only the negative parameter is active, return -1.
  if (negativeIsActive) return KeyDirectionsEnum.NEGATIVE;

  // If only the positive parameter is active, return 1.
  return KeyDirectionsEnum.POSITIVE;
}
