// import {Howl} from 'howler';
import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import {createApp, onLoad, onResize, setupKeybinds} from './createApp';
import {setupWindowHooks} from './createApp';
import {updateStarFieldAction as updateStarFieldAction} from './store/backgroundStage/action';
import {getStarField} from './store/backgroundStage/selector';
import {updateGameElementsAction} from './store/gameElement/action';
import {getGameElements} from './store/gameElement/selector';
import {Dispatch, GetState, store} from './store/gameReducer';
import {getKeyboard} from './store/keyboard/selector';
import {getPlayer} from './store/player/selector';
import {updateViewportCoordinateAction} from './store/viewport/action';
import {getViewport} from './store/viewport/selector';
import {Coordinate, Renderer} from './type';
import {VERSION} from './util';
import {
  addForceToPlayerMatterBodyFromKeyboard,
  addForceToPlayerMatterBodyFromMouseCoordinate
} from './util/playerMovement';
import {
  addStarsToField,
  calculateStarFieldBoundary,
  populateStarField,
  pruneStarField,
  repositionStarField
} from './util/star';
import {calculateUpdatedViewportCoordinateFromKeyboard} from './util/viewport';
import {calculatePositionRelativeToViewport, calculateViewportCoordinate} from './util/viewport';

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

  const backgroundStage = new PIXI.Container();
  stage.addChild(backgroundStage);

  const foregroundStage = new PIXI.Container();
  stage.addChild(foregroundStage);

  // Hook for browser window resizes.
  const resize = async (): Promise<void> => onResize(getState, store.dispatch, renderer);
  resize();

  // Hook for initial loading of assets.
  const onload = async (): Promise<void> =>
    onLoad(getState, store.dispatch, engine.world, backgroundStage, foregroundStage, view);

  // Attach hooks to window.
  setupWindowHooks(onload, resize);

  // Callback for game loop.
  const onGameLoop = () => gameLoop(getState, store.dispatch, engine.world, renderer, foregroundStage, backgroundStage);

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
  stage: PIXI.Container,
  backgroundStage: PIXI.Container
): void {
  // 1. Handle player loop first, to account for keyboard inputs to apply changes to the matter body.
  playerLoop(getState, dispatch, renderer);

  // 2. Handle game element loop next, to account for changes in matter position and rotation.
  gameElementLoop(getState, dispatch);

  // 3. Handle sprite loop afterwards, to align canvas with the game world's coordinates (relative to the viewport).
  spriteLoop(getState);

  // 4. Handle viewport loop last, as it can depend on updated positions of game elements.
  viewportLoop(getState, dispatch);

  // 5. Draw the star field.
  backgroundStageLoop(getState, dispatch, backgroundStage);

  // 6. Optionally draw debug wire frames from the Matter world.
  debugLoop(getState, world, stage);

  renderer.render(stage);
}

// Set forces on player matter from keyboard inputs, and update player coordinate
// to be aligned with the matter position.
function playerLoop(getState: GetState, dispatch: Dispatch, renderer: Renderer): void {
  const state = getState();
  const keyboard = getKeyboard(state);
  const player = getPlayer(state);
  const viewport = getViewport(state);

  if (!player.gameElement) return;

  const {matterBody: playerMatterBody} = player.gameElement;

  if (!playerMatterBody) return;

  // Apply forces from keyboard presses, before updating state with values from matter.
  addForceToPlayerMatterBodyFromKeyboard(keyboard, playerMatterBody);

  const mouseCoordinate: Coordinate = renderer.plugins.interaction.mouse.global;

  addForceToPlayerMatterBodyFromMouseCoordinate(
    dispatch,
    mouseCoordinate,
    viewport.coordinate,
    playerMatterBody,
    player.pidState
  );
}

// Update game element coordinates to be aligned with their matter positions.
function gameElementLoop(getState: GetState, dispatch: Dispatch) {
  const state = getState();

  const gameElements = getGameElements(state);

  const updatedGameElements = gameElements.map(gameElement => {
    const {matterBody} = gameElement;

    if (!matterBody) return gameElement;

    const coordinate: Coordinate = matterBody.position;
    const rotation = (2 * Math.PI + matterBody.angle) % (2 * Math.PI);

    return {...gameElement, coordinate, rotation};
  });

  dispatch(updateGameElementsAction(updatedGameElements));
}

function spriteLoop(getState: GetState): void {
  const state = getState();

  const viewport = getViewport(state);
  const {coordinate: viewportCoordinate} = viewport;

  const gameElements = getGameElements(state);
  gameElements.forEach(gameElement => {
    const gameElementPosition = calculatePositionRelativeToViewport(gameElement.coordinate, viewportCoordinate);

    gameElement.pixiSprite.position.set(gameElementPosition.x, gameElementPosition.y);
    gameElement.pixiSprite.rotation = gameElement.rotation;
  });
}

function viewportLoop(getState: GetState, dispatch: Dispatch): void {
  const state = getState();
  const keyboard = getKeyboard(state);
  const viewport = getViewport(state);

  const updatedViewportCoordinate = calculateUpdatedViewportCoordinateFromKeyboard(keyboard, viewport.coordinate);

  dispatch(updateViewportCoordinateAction(updatedViewportCoordinate));
}

function backgroundStageLoop(getState: GetState, dispatch: Dispatch, backgroundStage: PIXI.Container): void {
  const state = getState();
  const viewport = getViewport(state);
  const starField = getStarField(state);

  const updatedStarField = new Map(starField);

  const starFieldExpectedBoundary = calculateStarFieldBoundary(viewport.coordinate, viewport.dimension);

  if (updatedStarField.size === 0)
    addStarsToField(
      backgroundStage,
      viewport.coordinate,
      updatedStarField,
      starFieldExpectedBoundary.topLeft,
      starFieldExpectedBoundary.bottomRight
    );
  else {
    pruneStarField(updatedStarField, starFieldExpectedBoundary.topLeft, starFieldExpectedBoundary.bottomRight);

    const starFieldCurrentBoundary = repositionStarField(viewport.coordinate, updatedStarField);

    populateStarField(
      backgroundStage,
      viewport.coordinate,
      updatedStarField,
      starFieldExpectedBoundary.topLeft,
      starFieldExpectedBoundary.bottomRight,
      starFieldCurrentBoundary.topLeft,
      starFieldCurrentBoundary.bottomRight
    );
  }

  dispatch(updateStarFieldAction(updatedStarField));
}

function debugLoop(getState: GetState, world: Matter.World, stage: PIXI.Container): void {
  const state = getState();

  const viewport = getViewport(state);
  const {coordinate: viewportCoordinate} = viewport;

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
