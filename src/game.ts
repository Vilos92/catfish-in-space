import Matter from 'matter-js';
import * as PIXI from 'pixi.js';

import {createApp, onLoad, onResize, setupCollisions, setupKeybinds, setupWorld} from './createApp';
import {setupWindowHooks} from './createApp';
import {createGameOverTextDisplayElement} from './element/ui';
import {updateStarFieldAAction, updateStarFieldBAction} from './store/backgroundStage/action';
import {getStarFieldA, getStarFieldB} from './store/backgroundStage/selector';
import {removeGameElementByIdAction} from './store/collision/action';
import {updateGameElementsAction} from './store/gameElement/action';
import {getGameElements, getPhysicsElementByMatterId} from './store/gameElement/selector';
import {Dispatch, GetState, store} from './store/gameReducer';
import {getKeyboard} from './store/keyboard/selector';
import {clearGameOverElementAction, updateGameOverElementAction, updateIsGameOverAction} from './store/match/action';
import {getMatch} from './store/match/selector';
import {getMouse} from './store/mouse/selector';
import {
  clearPlayerGameElementAction,
  updatePlayerGameElementAction,
  updatePlayerIsViewportLockedAction
} from './store/player/action';
import {getPlayer} from './store/player/selector';
import {updateViewportCoordinateAction} from './store/viewport/action';
import {getViewport} from './store/viewport/selector';
import {Coordinate, isPhysicsElement, MouseButtonCodesEnum, PhysicsElement, Renderer} from './type';
import {createComputeIsKeyClicked} from './utility/keyboard';
import {firePlayerLaserBullet} from './utility/laserBullet';
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
  const onload = async (): Promise<void> => onLoad(getState, store.dispatch, engine.world, foregroundStage, view);

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
  // Optionally draw debug wire frames from the Matter world.
  debugLoop(getState, world, stage);

  // Handle player loop first, to account for keyboard inputs to apply changes to the matter body.
  playerLoop(getState, dispatch, world, renderer, stage);

  // Handle health next, to destroy game elements which have 0 or lower health.
  healthLoop(getState, dispatch, world);

  // Handle position loop, to account for changes in matter position and rotation.
  positionLoop(getState, dispatch);

  // Handle sprite loop afterwards, to align canvas with the game world's coordinates (relative to the viewport).
  spriteLoop(getState);

  // Handle viewport loop last, as it can depend on updated positions of game elements.
  viewportLoop(getState, dispatch);

  // Draw the star field.
  backgroundStageLoop(getState, dispatch, backgroundStage);

  // Draw any UI elements on top.
  uiLoop(getState, dispatch, world, stage);

  // Make updates to sound elements to account for spatial audio.
  audioLoop(getState);

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
  const physicsElementByMatterId = getPhysicsElementByMatterId(state);

  if (!player.gameElement) return;
  const currentPlayerGameElement = player.gameElement;

  // Align our player Physics Element with the Game Elements state.
  const playerGameElement = physicsElementByMatterId.get(currentPlayerGameElement.matterBody.id);

  if (!playerGameElement || !isPhysicsElement(playerGameElement)) {
    dispatch(clearPlayerGameElementAction());
    dispatch(updateIsGameOverAction(true));
    return;
  }

  const {matterBody: playerMatterBody} = playerGameElement;

  // Apply forces from keyboard presses, before updating state with values from matter.
  addForceToPlayerMatterBodyFromKeyboard(dispatch, keyboard, playerMatterBody, player.thrusterSound);

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

  const updatedPlayerGameElement: PhysicsElement = {...playerGameElement, coordinate, rotation};
  dispatch(updatePlayerGameElementAction(updatedPlayerGameElement));

  // Lasers go pew.
  if (mouse.buttonStateMap[MouseButtonCodesEnum.MOUSE_BUTTON_PRIMARY].isActive)
    firePlayerLaserBullet(
      dispatch,
      world,
      stage,
      viewport.coordinate,
      player.primaryFireTimestamp,
      player.gameElement.pixiSprite,
      player.gameElement.matterBody
    );
}

// Destroy Game Elements which have 0 or lower health, and remove from state.
function healthLoop(getState: GetState, dispatch: Dispatch, world: Matter.World) {
  const state = getState();

  const gameElements = getGameElements(state);

  gameElements.forEach(gameElement => {
    if (gameElement.health === undefined || gameElement.health > 0) return;

    gameElement.pixiSprite.destroy();

    if (isPhysicsElement(gameElement)) Matter.Composite.remove(world, gameElement.matterBody);

    dispatch(removeGameElementByIdAction(gameElement.id));
  });

  const updatedGameElements = gameElements.filter(
    gameElement => gameElement.health === undefined || gameElement.health > 0
  );

  dispatch(updateGameElementsAction(updatedGameElements));
}

// Update game element coordinates to be aligned with their matter positions.
function positionLoop(getState: GetState, dispatch: Dispatch) {
  const state = getState();

  const gameElements = getGameElements(state);

  // Update remaining game elements based on their matter positions.
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

function uiLoop(getState: GetState, dispatch: Dispatch, world: Matter.World, stage: PIXI.Container): void {
  const state = getState();
  const viewport = getViewport(state);
  const match = getMatch(state);
  const mouse = getMouse(state);

  if (!match.isGameOver) return;

  // Restart match if user presses the primary key after the game has ended.
  if (mouse.buttonStateMap[MouseButtonCodesEnum.MOUSE_BUTTON_PRIMARY].isActive) {
    match.gameOverElement?.pixiSprite.destroy();
    dispatch(clearGameOverElementAction());

    // Clear game over and restart match.
    dispatch(updateIsGameOverAction(false));
    startMatch(getState, dispatch, world, stage);
    return;
  }

  // Create a game over text if one does not already exist.
  if (match.gameOverElement) return;

  const gameOverText = createGameOverTextDisplayElement(viewport.dimension);

  stage.addChild(gameOverText.pixiSprite);
  dispatch(updateGameOverElementAction(gameOverText));
}

function audioLoop(getState: GetState): void {
  const state = getState();
  const player = getPlayer(state);
  const viewport = getViewport(state);

  if (!player.gameElement) return;

  const playerCoordinate = player.gameElement.coordinate;

  const viewportCenterCoordinate: Coordinate = {
    x: viewport.coordinate.x + viewport.dimension.width / 2,
    y: viewport.coordinate.y + viewport.dimension.height / 2
  };

  const playerPositionRelativeToCenter = calculatePositionRelativeToViewport(
    playerCoordinate,
    viewportCenterCoordinate
  );

  player.thrusterSound?.pos(
    playerPositionRelativeToCenter.x / viewport.dimension.width,
    playerPositionRelativeToCenter.y / viewport.dimension.height,
    0
  );
}

/**
  Clear any resources for an ongoing match, and begin a new match.
 */
function startMatch(
  getState: GetState,
  dispatch: Dispatch,
  world: Matter.World,
  foregroundStage: PIXI.Container
): void {
  const state = getState();
  const gameElements = getGameElements(state);

  // Remove sprites from foreground.
  foregroundStage.removeChildren();

  // Remove Physics Bodies.
  gameElements.forEach(gameElement => {
    if (!isPhysicsElement(gameElement)) return;

    Matter.World.remove(world, gameElement.matterBody);
  });

  // Clear the Game Elements from the reducer.
  dispatch(updateGameElementsAction([]));

  setupWorld(getState, dispatch, world, foregroundStage);
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
