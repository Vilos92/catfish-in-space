// import {Howl} from 'howler';
import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import {createApp, onLoad, onResize, setupKeybinds} from './createApp';
import {setupWindowHooks} from './createApp';
import {getGameElements} from './store/gameElement/selector';
import {Dispatch, GetState, store} from './store/gameReducer';
import {getKeyboard} from './store/keyboard/selector';
import {updatePlayerCoordinateAction, updatePlayerRotationAction} from './store/player/action';
import {getPlayer} from './store/player/selector';
import {updateViewportCoordinateAction} from './store/viewport/action';
import {getViewport} from './store/viewport/selector';
import {Coordinate, Renderer} from './type';
import {addForceToPlayerMatterBodyFromKeyboard, calculateUpdatedViewportCoordinateFromKeyboard, VERSION} from './util';
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
  const onGameLoop = () => gameLoop(getState, store.dispatch, engine.world, renderer, stage);

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
export function gameLoop(
  getState: GetState,
  dispatch: Dispatch,
  world: Matter.World,
  renderer: Renderer,
  stage: PIXI.Container
): void {
  // 1. Handle player loop first, to account for keyboard inputs and changes in matter position.
  playerLoop(getState, dispatch);

  // 2. Handle sprite loop after player loop, to account for changes in matter position.
  spriteLoop(getState, world, stage);

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

  // Restrict the current player matter angle within the bounds of 0 to 2PI
  const updatedPlayerRotation = (2 * Math.PI + playerMatterBody.angle) % (2 * Math.PI);
  dispatch(updatePlayerRotationAction(updatedPlayerRotation));
}

function spriteLoop(getState: GetState, world: Matter.World, stage: PIXI.Container): void {
  const state = getState();

  const player = getPlayer(state);
  const {coordinate: playerCoordinate, rotation: playerRotation, pixiSprite: playerSprite} = player.gameElement;

  const viewport = getViewport(state);
  const {coordinate: viewportCoordinate} = viewport;

  if (!playerSprite) return;

  const playerPosition = calculatePositionRelativeToViewport(playerCoordinate, viewportCoordinate);
  playerSprite.position.set(playerPosition.x, playerPosition.y);

  playerSprite.rotation = playerRotation;

  // Reposition all GameElements based on MatterJS coordinates.
  const gameElements = getGameElements(state);
  gameElements.forEach(gameElement => {
    if (!gameElement.matterBody || !gameElement.pixiSprite) return;

    const gameElementPosition = calculatePositionRelativeToViewport(
      gameElement.matterBody.position,
      viewportCoordinate
    );

    gameElement.pixiSprite.position.set(gameElementPosition.x, gameElementPosition.y);
    gameElement.pixiSprite.rotation = gameElement.matterBody.angle;
  });

  // Draw debug wire frame from the Matter world.
  drawWireFrameGraphics(viewportCoordinate, world, stage);
}

// TODO: Use store for this, rather than this brittle variable.
let lastWireFrameGraphics: PIXI.Graphics | undefined = undefined;

function drawWireFrameGraphics(viewportCoordinate: Coordinate, world: Matter.World, stage: PIXI.Container) {
  const wireFrameGraphics = new PIXI.Graphics();
  wireFrameGraphics.lineStyle(1, 0x00ff00);

  world.bodies.forEach(body => {
    const {vertices} = body;

    const initialWireFramePosition = calculatePositionRelativeToViewport(vertices[0], viewportCoordinate);

    wireFrameGraphics.moveTo(initialWireFramePosition.x, initialWireFramePosition.y);

    for (let i = 1; i < vertices.length; i++) {
      const wireFramePosition = calculatePositionRelativeToViewport(vertices[i], viewportCoordinate);

      wireFrameGraphics.lineTo(wireFramePosition.x, wireFramePosition.y);
    }

    wireFrameGraphics.lineTo(initialWireFramePosition.x, initialWireFramePosition.y);
  });

  if (lastWireFrameGraphics) lastWireFrameGraphics.destroy();

  stage.addChild(wireFrameGraphics);
  lastWireFrameGraphics = wireFrameGraphics;
}

function viewportLoop(getState: GetState, dispatch: Dispatch): void {
  const state = getState();
  const keyboard = getKeyboard(state);
  const viewport = getViewport(state);

  const updatedViewportCoordinate = calculateUpdatedViewportCoordinateFromKeyboard(keyboard, viewport.coordinate);

  dispatch(updateViewportCoordinateAction(updatedViewportCoordinate));
}
