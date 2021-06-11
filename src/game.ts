// import {Howl} from 'howler';
import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import {createApp, onLoad, onResize, setupCollisions, setupKeybinds} from './createApp';
import {setupWindowHooks} from './createApp';
import {updateStarFieldAAction, updateStarFieldBAction} from './store/backgroundStage/action';
import {getStarFieldA, getStarFieldB} from './store/backgroundStage/selector';
import {updateGameElementsAction} from './store/gameElement/action';
import {getGameElements} from './store/gameElement/selector';
import {Dispatch, GetState, store} from './store/gameReducer';
import {getKeyboard} from './store/keyboard/selector';
import {getMouse} from './store/mouse/selector';
import {
  updatePlayerGameElementAction,
  updatePlayerIsViewportLockedAction,
  updatePlayerPrimaryFireTimestampAction
} from './store/player/action';
import {getPlayer} from './store/player/selector';
import {updateViewportCoordinateAction} from './store/viewport/action';
import {getViewport} from './store/viewport/selector';
import {
  CollisionTypesEnum,
  Coordinate,
  GameElement,
  isPhysicsElement,
  MouseButtonCodesEnum,
  PhysicsElement,
  Renderer,
  Velocity
} from './type';
import {addGameElement, VERSION} from './utility';
import {createComputeIsKeyClicked} from './utility/keyboard';
import {
  addForceToPlayerMatterBodyFromKeyboard,
  addForceToPlayerMatterBodyFromMouseCoordinate
} from './utility/playerMovement';
import {BACKGROUND_PARALLAX_SCALE_A, BACKGROUND_PARALLAX_SCALE_B, updateStarField} from './utility/star';
import {
  calculatePositionRelativeToViewport,
  calculateUpdatedViewportCoordinateFromKeyboard,
  calculateViewportCoordinate
} from './utility/viewport';

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
  const onload = async (): Promise<void> =>
    onLoad(getState, store.dispatch, engine.world, backgroundStage, foregroundStage, view);

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
  // 1. Optionally draw debug wire frames from the Matter world.
  debugLoop(getState, world, stage);

  // Handle player loop first, to account for keyboard inputs to apply changes to the matter body.
  playerLoop(getState, dispatch, world, renderer, stage);

  // Handle game element loop next, to account for changes in matter position and rotation.
  gameElementLoop(getState, dispatch);

  // Handle sprite loop afterwards, to align canvas with the game world's coordinates (relative to the viewport).
  spriteLoop(getState);

  // Handle viewport loop last, as it can depend on updated positions of game elements.
  viewportLoop(getState, dispatch);

  // Draw the star field.
  backgroundStageLoop(getState, dispatch, backgroundStage);

  renderer.render(stage);
}

// Set forces on player matter from keyboard inputs, and update player coordinate
// to be aligned with the matter position.
function playerLoop(
  getState: GetState,
  dispatch: Dispatch,
  world: Matter.World,
  renderer: Renderer,
  stage: PIXI.Container
): void {
  const state = getState();
  const keyboard = getKeyboard(state);
  const mouse = getMouse(state);
  const player = getPlayer(state);
  const viewport = getViewport(state);

  if (!player.gameElement) return;

  if (!isPhysicsElement(player.gameElement)) return;

  const {matterBody: playerMatterBody} = player.gameElement;

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

  // We must update the player GameElement here to account for the coordinate
  // and rotation needed by the viewport. The sprite loop is responsible for
  // other operations regarding presentation.
  const coordinate: Coordinate = playerMatterBody.position;
  const rotation = playerMatterBody.angle % (2 * Math.PI);

  const updatedPlayerGameElement: PhysicsElement = {...player.gameElement, coordinate, rotation};
  dispatch(updatePlayerGameElementAction(updatedPlayerGameElement));

  // Lasers go pew.
  const now = Date.now();
  const fireBuffer = 250;
  if (
    now > player.primaryFireTimestamp + fireBuffer &&
    player.gameElement.matterBody &&
    mouse.buttonStateMap[MouseButtonCodesEnum.MOUSE_BUTTON_PRIMARY].isActive
  ) {
    const laserBullet = createLaserBulletGameElement(
      viewport.coordinate,
      player.gameElement.pixiSprite.getBounds().width,
      player.gameElement.matterBody.position,
      player.gameElement.matterBody.angle,
      player.gameElement.matterBody.velocity
    );
    addGameElement(dispatch, world, stage, laserBullet);
    dispatch(updatePlayerPrimaryFireTimestampAction(now));
  }
}

// Update game element coordinates to be aligned with their matter positions.
function gameElementLoop(getState: GetState, dispatch: Dispatch) {
  const state = getState();

  const gameElements = getGameElements(state);

  const updatedGameElements = gameElements.map(gameElement => {
    if (!isPhysicsElement(gameElement)) return gameElement;

    const {matterBody} = gameElement;

    const coordinate: Coordinate = matterBody.position;
    const rotation = matterBody.angle % (2 * Math.PI);

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

const computeIsViewportKeyClicked = createComputeIsKeyClicked();

function viewportLoop(getState: GetState, dispatch: Dispatch): void {
  const state = getState();
  const keyboard = getKeyboard(state);
  const player = getPlayer(state);
  const viewport = getViewport(state);

  if (computeIsViewportKeyClicked(keyboard.keyStateMap.KeyV.isActive)) {
    dispatch(updatePlayerIsViewportLockedAction(!player.isViewportLocked));
  }

  const updatedViewportCoordinate: Coordinate =
    player.isViewportLocked && player.gameElement
      ? calculateViewportCoordinate(player.gameElement.coordinate, viewport.dimension)
      : calculateUpdatedViewportCoordinateFromKeyboard(keyboard, viewport.coordinate);

  dispatch(updateViewportCoordinateAction(updatedViewportCoordinate));
}

function backgroundStageLoop(getState: GetState, dispatch: Dispatch, backgroundStage: PIXI.Container): void {
  const state = getState();
  const viewport = getViewport(state);
  const starFieldA = getStarFieldA(state);
  const starFieldB = getStarFieldB(state);

  const updatedStarFieldA = updateStarField(
    backgroundStage,
    viewport.coordinate,
    viewport.dimension,
    starFieldA,
    BACKGROUND_PARALLAX_SCALE_A
  );

  const updatedStarFieldB = updateStarField(
    backgroundStage,
    viewport.coordinate,
    viewport.dimension,
    starFieldB,
    BACKGROUND_PARALLAX_SCALE_B
  );

  dispatch(updateStarFieldAAction(updatedStarFieldA));
  dispatch(updateStarFieldBAction(updatedStarFieldB));
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

function createLaserBulletGameElement(
  viewportCoordinate: Coordinate,
  playerWidth: number,
  playerCoordinate: Coordinate,
  playerRotation: number,
  playerVelocity: Velocity
): GameElement {
  // Bullet should be in front of the player.
  // TOOD: Get width of player.
  const initialLaserCoordinate = {
    x: playerCoordinate.x + (Math.cos(playerRotation) * playerWidth) / 2 + 5,
    y: playerCoordinate.y + (Math.sin(playerRotation) * playerWidth) / 2 + 5
  };

  const initialLaserVelocity = {
    x: playerVelocity.x + Math.cos(playerRotation) * 50,
    y: playerVelocity.y + Math.sin(playerRotation) * 50
  };

  const laserPosition = calculatePositionRelativeToViewport(initialLaserCoordinate, viewportCoordinate);

  const laserPixi = new PIXI.Sprite(PIXI.Texture.from('laserBullet1'));
  laserPixi.scale.set(0.5, 0.5);
  laserPixi.anchor.set(0.5, 0.5);

  laserPixi.position.set(laserPosition.x, laserPosition.y);
  laserPixi.rotation = playerRotation;

  const laserMatter = Matter.Bodies.rectangle(
    // Game and matter coordinates have a one-to-one mapping.
    initialLaserCoordinate.x,
    initialLaserCoordinate.y,
    // We use dimensions of our sprite.
    laserPixi.width,
    laserPixi.height,
    {
      // Approximate mass of Falcon 9.
      mass: 0.1,
      angle: playerRotation
    }
  );

  Matter.Body.setVelocity(laserMatter, initialLaserVelocity);

  return {
    coordinate: initialLaserCoordinate,
    rotation: playerRotation,
    matterBody: laserMatter,
    collisionType: CollisionTypesEnum.PROJECTILE,
    health: 1,
    pixiSprite: laserPixi
  };
}
