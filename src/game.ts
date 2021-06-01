// import {Howl} from 'howler';
import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import {createApp, onLoad, onResize, setupKeybinds} from './createApp';
import {setupWindowHooks} from './createApp';
import {StarField} from './store/backgroundStage/reducer';
import {getStarField} from './store/backgroundStage/selector';
import {updateGameElementsAction} from './store/gameElement/action';
import {getGameElements} from './store/gameElement/selector';
import {Dispatch, GetState, store} from './store/gameReducer';
import {getKeyboard} from './store/keyboard/selector';
import {getPlayer} from './store/player/selector';
import {updateViewportCoordinateAction} from './store/viewport/action';
import {getViewport} from './store/viewport/selector';
import {Coordinate, GameElement, Renderer} from './type';
import {VERSION} from './util';
import {
  addForceToPlayerMatterBodyFromKeyboard,
  addForceToPlayerMatterBodyFromMouseCoordinate
} from './util/playerMovement';
import {createStarGraphic} from './util/star';
// import {createStarGraphic} from './util/star';
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
  backgroundStageLoop(getState, backgroundStage);

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
    if (!gameElement.pixiSprite) return;

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

function backgroundStageLoop(getState: GetState, backgroundStage: PIXI.Container): void {
  const state = getState();
  const viewport = getViewport(state);
  const starField = getStarField(state);

  // Do not erase stars until it is outside a threshold of the screen to:
  // 1. Ensure stars at the edge of the screen do not "pop-in" to existence.
  // 2. Make it less obvious that the stars are randomly generated, if moving back and forth.
  const buffer = 32;

  const rowMin = viewport.coordinate.y - buffer;
  const rowMax = viewport.coordinate.y + viewport.dimension.height + buffer;

  const colMin = viewport.coordinate.x - buffer;
  const colMax = viewport.coordinate.x + viewport.dimension.width + buffer;

  let starfieldRowMin: number | undefined;
  let starfieldRowMax: number | undefined;

  let starfieldColMin: number | undefined;
  let starfieldColMax: number | undefined;

  // For all cells in the Star Field:
  // 1. Remove stars which are now outside of the viewport (with a buffer).
  // 2. Reposition the remaining stars relative to the viewport.
  const rows = starField.keys();
  for (const row of rows) {
    if (!starField.has(row)) {
      starField.set(row, new Map<number, GameElement>());
    }
    const cols = starField.get(row)?.keys() ?? [];

    for (const col of cols) {
      const starGameElement = starField.get(row)?.get(col);

      if (!starGameElement || !starGameElement.pixiSprite) continue;

      if (row < rowMin || row > rowMax || col < colMin || col > colMax) {
        starGameElement.pixiSprite.destroy();
        starField.get(row)?.delete(col);

        continue;
      }

      const newPosition = calculatePositionRelativeToViewport(starGameElement.coordinate, viewport.coordinate);
      starGameElement.pixiSprite.position.set(newPosition.x, newPosition.y);

      starfieldRowMin = starfieldRowMin ? Math.min(starfieldRowMin, row) : row;
      starfieldRowMax = starfieldRowMax ? Math.max(starfieldRowMax, row) : row;
      starfieldColMin = starfieldColMin ? Math.min(starfieldColMin, col) : col;
      starfieldColMax = starfieldColMax ? Math.max(starfieldColMax, col) : col;
    }

    // If no more columns remain for a row, we no longer need it in the Star Field.
    if (starField.get(row)?.size === 0) starField.delete(row);
  }

  if (!starfieldRowMin || !starfieldRowMax) {
    // Insert between rowMin and rowMax
    for (let y = rowMin; y < rowMax; y++) {
      for (let x = colMin; x < colMax; x++) {
        addStarToField(backgroundStage, viewport.coordinate, starField, x, y);
      }
    }
  } else {
    // Must check both cases since viewport could be resized, not just moved.

    if (rowMin < starfieldRowMin) {
      // Insert rows below current min.
      for (let y = rowMin; y < starfieldRowMin; y++) {
        for (let x = colMin; x < colMax; x++) {
          addStarToField(backgroundStage, viewport.coordinate, starField, x, y);
        }
      }
    }

    if (rowMax > starfieldRowMax) {
      // Insert rows above current max.
      for (let y = starfieldRowMax + 1; y <= rowMax; y++) {
        for (let x = colMin; x < colMax; x++) {
          addStarToField(backgroundStage, viewport.coordinate, starField, x, y);
        }
      }
    }
  }

  if (!starfieldColMin || colMin < starfieldColMin) {
    // Insert cols below current max.
  } else if (!starfieldColMax || colMax > starfieldColMax) {
    // Insert cols above current max.
  }
}

function addStarToField(
  backgroundStage: PIXI.Container,
  viewportCoordinate: Coordinate,
  starField: StarField,
  x: number,
  y: number
) {
  // Create a row in the Star Field if we do not already have one.
  if (!starField.has(y)) starField.set(y, new Map<number, GameElement>());

  // If we already have a star at this location, skip.
  if (starField.get(y)?.has(x)) return;

  if (Math.random() > 1 / 256) return;

  const coordinate = {x, y};
  const star = createStarGraphic(viewportCoordinate, coordinate);

  starField.get(y)?.set(x, {
    coordinate,
    rotation: 0,
    pixiSprite: star
  });

  starField.get(y)?.set(x, {
    coordinate,
    rotation: 0,
    pixiSprite: star
  });

  backgroundStage.addChild(star);
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
