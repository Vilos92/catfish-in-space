import Matter, {Events} from 'matter-js';
import * as PIXI from 'pixi.js';

import {createPlayerGameElement} from './element/player';
import {createRectangleGameElement} from './element/rectangle';
import {getPhysicsElementByMatterId} from './store/gameElement/selector';
import {Dispatch, GetState} from './store/gameReducer';
import {keyDownAction, keyUpAction} from './store/keyboard/action';
import {mouseButtonDownAction, mouseButtonUpAction} from './store/mouse/action';
import {updatePlayerGameElementAction} from './store/player/action';
import {getPlayer} from './store/player/selector';
import {updateViewportCoordinateAction} from './store/viewport/action';
import {getViewport} from './store/viewport/selector';
import {Callback, CallbackWithArg, KeyCodesEnum, Renderer} from './type';
import {addGameElement} from './utility';
import {handlePhysicsCollision} from './utility/collision';
import {calculatePositionRelativeToViewport, calculateViewportCoordinate} from './utility/viewport';

/**
 * Browser.
 */

export function setupKeybinds(dispatch: Dispatch, view: HTMLCanvasElement): void {
  const handleKeydown: CallbackWithArg<KeyboardEvent> = (event: KeyboardEvent): void => {
    const keyCode = event.code;
    dispatch(keyDownAction(keyCode as KeyCodesEnum));
  };

  const handleKeyup: CallbackWithArg<KeyboardEvent> = (event: KeyboardEvent): void => {
    const keyCode = event.code;
    dispatch(keyUpAction(keyCode as KeyCodesEnum));
  };

  const handleMousedown: CallbackWithArg<MouseEvent> = (event: MouseEvent): void => {
    const buttonCode = event.button;
    dispatch(mouseButtonDownAction(buttonCode));
  };

  const handleMouseup: CallbackWithArg<MouseEvent> = (event: MouseEvent): void => {
    const buttonCode = event.button;
    dispatch(mouseButtonUpAction(buttonCode));
  };

  window.addEventListener('keydown', handleKeydown, false);
  window.addEventListener('keyup', handleKeyup, false);

  view.addEventListener('mousedown', handleMousedown, false);
  view.addEventListener('mouseup', handleMouseup, false);
  // This disables the right-click context menu on the game canvas.
  view.addEventListener('contextmenu', event => event.preventDefault(), false);
}

/**
 * Matter.
 */

export function setupCollisions(getState: GetState, dispatch: Dispatch, engine: Matter.Engine): void {
  const onCollisionActive: CallbackWithArg<Matter.IEventCollision<Matter.Engine>> = (
    collisions: Matter.IEventCollision<Matter.Engine>
  ) => {
    const state = getState();
    const physicsElementByMatterId = getPhysicsElementByMatterId(state);

    collisions.pairs.forEach(collisionPair => {
      const physicsElementA = physicsElementByMatterId.get(collisionPair.bodyA.id);
      const physicsElementB = physicsElementByMatterId.get(collisionPair.bodyB.id);

      if (!physicsElementA || !physicsElementB) return;

      handlePhysicsCollision(getState, dispatch, physicsElementA, physicsElementB);
    });
  };

  Events.on(engine, 'collisionActive', onCollisionActive);
}

/**
 * PIXI.
 */

export function createApp(getState: GetState): PIXI.Application {
  const state = getState();

  const {width, height} = getViewport(state).dimension;

  return new PIXI.Application({
    backgroundColor: 0x202020,
    width,
    height,
    resolution: window.devicePixelRatio,
    autoDensity: true
  });
}

export function setupWindowHooks(onload: Callback, resize: Callback): void {
  window.onload = onload;
  window.addEventListener('resize', resize);
}

export async function onResize(getState: GetState, dispatch: Dispatch, renderer: Renderer): Promise<void> {
  const state = getState();

  const viewportDimension = getViewport(state).dimension;

  const player = getPlayer(state);

  renderer.resize(viewportDimension.width, viewportDimension.height);

  if (!player.gameElement) return;

  // We should re-arrange the viewport to be centered on our player.
  const viewportCoordinate = calculateViewportCoordinate(player.gameElement.coordinate, viewportDimension);
  dispatch(updateViewportCoordinateAction(viewportCoordinate));

  const {pixiSprite: playerSprite} = player.gameElement;

  const position = calculatePositionRelativeToViewport(playerSprite, getViewport(state).coordinate);

  playerSprite.position.set(position.x, position.y);
}

export async function onLoad(
  getState: GetState,
  dispatch: Dispatch,
  world: Matter.World,
  backgroundStage: PIXI.Container,
  foregroundStage: PIXI.Container,
  view: HTMLCanvasElement
): Promise<void> {
  // Do not append the game view to the DOM, until the assets are loaded.
  await loadGameAssets();

  document.body.appendChild(view);

  setupWorld(getState, dispatch, world, foregroundStage);
}

/**
 * Load game assets as a side-effect (no return value).
 * Currently these assets are just a sprite sheet.
 */

async function loadGameAssets(): Promise<void> {
  return new Promise((res, rej) => {
    const loader = PIXI.Loader.shared;
    loader.add('rabbit', './assets/simpleSpriteSheet.json');

    loader.add('spaceship', './assets/sprites/nightraiderfixed.png');

    loader.add('laserBullet1', './assets/sprites/laserBullet1.png');

    loader.onComplete.once(() => {
      res();
    });

    loader.onError.once(() => {
      rej();
    });

    loader.load();
  });
}

/**
 * Setup the stage of the game, by adding initial elements.
 */
function setupWorld(getState: GetState, dispatch: Dispatch, world: Matter.World, foregroundStage: PIXI.Container) {
  const state = getState();
  const viewport = getViewport(state);

  const player = createPlayerGameElement(viewport.coordinate);
  dispatch(updatePlayerGameElementAction(player));
  addGameElement(dispatch, world, foregroundStage, player);

  const testRectangle1 = createRectangleGameElement(viewport.coordinate, {x: 600, y: -100});
  const testRectangle2 = createRectangleGameElement(viewport.coordinate, {x: -600, y: 100});
  addGameElement(dispatch, world, foregroundStage, testRectangle1);
  addGameElement(dispatch, world, foregroundStage, testRectangle2);
}
